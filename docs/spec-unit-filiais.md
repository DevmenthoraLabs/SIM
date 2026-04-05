# SPEC — Unit (Filiais) e User-Unit

**Versão:** 1.0
**Data:** 2026-04-03
**Status:** Aprovado para implementação

---

## 1. Contexto e Motivação

`Unit` representa uma unidade física operacional da organização: farmácia, almoxarifado, centro de distribuição, etc. É o **boundary operacional primário** do sistema — toda movimentação de estoque, dispensação e operação futura ocorre dentro do contexto de uma `Unit`.

A relação entre usuários e unidades é **N:N**: um gestor pode ter acesso a múltiplas filiais; uma filial tem múltiplos usuários. Essa relação é gerenciada pela entidade `UserUnit`.

---

## 2. Decisões Firmadas

| Decisão | Justificativa |
|---------|---------------|
| Relação User → Unit é N:N via `UserUnit` | Gestores operam em múltiplas filiais |
| `UserProfile.UnitId` é removido | Substituído pela relação N:N |
| Admin tem acesso cross-unit | Escopo é a org inteira, sem restrição de unidade |
| SuperAdmin está acima de tudo | Exclusivo do Suporte SIM — sem restrição de org ou unit |
| Roles operacionais exigem ≥ 1 unit ativa | Pharmacist, StockManager, ReceivingOperator precisam de unidade para operar — remoção bloqueada se for a última |
| UnitIds carregados via `SupabaseClaimsTransformation` (Scoped + IUnitOfWork) | DB query na transformação de claims, uma vez por request. `IClaimsTransformation` registrado como Scoped |
| `UserUnit` sempre cria novo registro no reassign | Rastreabilidade completa — nunca se reativa um vínculo antigo |
| Unique index parcial em `user_units` | `UNIQUE (UserId, UnitId) WHERE is_active = true` — permite histórico de vínculos |
| `Unit.Code` é único por org mas mutável | `Id` é o identificador estável; `Code` é label de negócio, pode ser corrigido por Admin |

---

## 3. Entidade: Unit

### 3.1 Domínio

```csharp
// SIM.Domain/Entities/Unit.cs
public class Unit : LifeCycleEntity, IOrganizationScoped
{
    public string Name { get; private set; }
    public string Code { get; private set; }        // Código interno — único por organização
    public string? Address { get; private set; }
    public string? Phone { get; private set; }
    public Guid OrganizationId { get; private set; }

    private Unit() { }

    public static Unit Create(
        string name,
        string code,
        string? address,
        string? phone,
        Guid organizationId)

    public void Update(
        string name,
        string code,
        string? address,
        string? phone)
        // Code é mutável mas único por org — handler verifica unicidade antes de chamar
}
```

**Invariantes de domínio:**
- `Name`: obrigatório, max 200 chars
- `Code`: obrigatório, max 20 chars, **único por organização** — mutável, mas unicidade verificada no handler antes de qualquer alteração
- `OrganizationId`: obrigatório
- `Phone`: se informado, max 20 chars

### 3.2 EF Configuration

```
Tabela: units
PKs: Id (ValueGeneratedNever)
Index único: (OrganizationId, Code)
FK: OrganizationId → organizations.Id (OnDelete: Restrict)
Global Query Filter: IOrganizationScoped
```

---

## 4. Entidade: UserUnit

### 4.1 Domínio

```csharp
// SIM.Domain/Entities/UserUnit.cs
public class UserUnit : LifeCycleEntity, IOrganizationScoped
{
    public Guid UserId { get; private set; }
    public Guid UnitId { get; private set; }
    public Guid OrganizationId { get; private set; }

    // Navigation
    public UserProfile? User { get; private set; }
    public Unit? Unit { get; private set; }

    private UserUnit() { }

    public static UserUnit Create(
        Guid userId,
        Guid unitId,
        Guid organizationId)
}
```

**Invariantes de domínio:**
- `UserId`, `UnitId`, `OrganizationId`: obrigatórios, não-Empty
- Combinação `(UserId, UnitId)` deve ser única (index único)
- `IsActive = true` na criação (via `LifeCycleEntity`)
- `Deactivate()` herdado de `LifeCycleEntity` — revoga o vínculo sem deletar

**O que `UserUnit` não valida (responsabilidade do handler):**
- User e Unit pertencem à mesma organização
- User não é SuperAdmin (SuperAdmin não tem restrição de unit)
- User com role Admin não precisa de UserUnit
- Não criar duplicata ativa (verificar existência antes de criar)

### 4.2 EF Configuration

```
Tabela: user_units
PKs: Id (ValueGeneratedNever)
Index único parcial: (UserId, UnitId) WHERE is_active = true
  → permite múltiplos registros históricos, mas apenas um ativo por par
FK: UserId → user_profiles.Id (OnDelete: Restrict)
FK: UnitId → units.Id (OnDelete: Restrict)
FK: OrganizationId → organizations.Id (OnDelete: Restrict)
Global Query Filter: IOrganizationScoped
```

---

## 5. Mudanças em UserProfile

### 5.1 Remoção de UnitId

`UserProfile.UnitId` (hoje nullable, reservado) é **removido**. A relação com unidades passa a ser exclusivamente via `UserUnit`.

```csharp
// Removido:
public Guid? UnitId { get; private set; }

// UserProfile.Create() — remover parâmetro unitId:
public static UserProfile Create(
    Guid supabaseUserId,
    string fullName,
    string email,
    UserRole role,
    Guid organizationId)
    // sem unitId
```

**Arquivos impactados:**
- `SIM.Domain/Entities/UserProfile.cs`
- `SIM.Infrastructure/Data/Configurations/UserProfileConfiguration.cs`
- `SIM.Application/Features/Users/InviteUserCommandHandler.cs`
- `SIM.Application/ViewModels/Users/InviteUserViewModel.cs`
- `SIM.Application/ViewModels/Users/UserViewModel.cs`
- `SIM.Application/Features/Users/GetUserByIdQuery.cs`

---

## 6. Infraestrutura de Autenticação — Mudanças

### 6.1 SimClaimTypes

Adicionar o novo claim type para UnitIds:

```csharp
// SIM.Domain/Constants/SimClaimTypes.cs
public static class SimClaimTypes
{
    public const string OrganizationId = "sim:organization_id";
    public const string UnitIds        = "sim:unit_ids";        // NOVO — GUIDs separados por vírgula
}
```

### 6.2 SupabaseClaimsTransformation

A transformação atual lê apenas do JWT (sem DB). Precisa ser estendida para carregar os UnitIds do usuário via query Dapper.

**Mudanças:**
- Injetar `IServiceScopeFactory` (necessário para acesso ao DB dentro da transformação)
- Criar scope e resolver `IUnitOfWork` para executar a query
- Registrar como `Scoped` ao invés de `Transient`

```csharp
// Fluxo após transformação:
// 1. Ler sim_role + sim_organization_id do JWT (já existe)
// 2. Obter UserId do claim NameIdentifier
// 3. Query user_units WHERE user_id = @UserId AND is_active = true
// 4. Serializar UnitIds como CSV → claim sim:unit_ids
// 5. Adicionar claim sim:is_admin (true se role == Admin)

// SQL para UnitIds:
SELECT unit_id
FROM user_units
WHERE user_id = @UserId
  AND is_active = true
  AND organization_id = @OrganizationId

// Resultado: "guid1,guid2,guid3" → claim sim:unit_ids
```

**Nota importante:** O guard de early-return `if (principal.HasClaim(c => c.Type == SimClaimTypes.OrganizationId))` já existe e garante que a DB query só ocorre **uma vez por request**.

### 6.3 ICurrentUserService

```csharp
// SIM.Application/Abstractions/ICurrentUserService.cs
public interface ICurrentUserService
{
    Guid UserId { get; }
    bool IsAuthenticated { get; }
    Guid? OrganizationId { get; }
    bool IsSuperAdmin { get; }

    // NOVOS:
    bool IsAdmin { get; }                           // Role == Admin (não SuperAdmin)
    IReadOnlyList<Guid> UnitIds { get; }            // Unidades com acesso ativo
    bool HasAccessToUnit(Guid unitId);              // Helper: IsAdmin || IsSuperAdmin || UnitIds.Contains(unitId)
}
```

### 6.4 CurrentUserService

```csharp
// SIM.WebApi/Auth/CurrentUserService.cs — adições:

public bool IsAdmin =>
    httpContextAccessor.HttpContext?.User.IsInRole(Roles.Admin) ?? false;

public IReadOnlyList<Guid> UnitIds
{
    get
    {
        var value = httpContextAccessor.HttpContext?.User
            .FindFirstValue(SimClaimTypes.UnitIds);

        if (string.IsNullOrEmpty(value)) return [];

        return value.Split(',')
            .Select(s => Guid.TryParse(s, out var id) ? id : (Guid?)null)
            .Where(id => id.HasValue)
            .Select(id => id!.Value)
            .ToList()
            .AsReadOnly();
    }
}

public bool HasAccessToUnit(Guid unitId) =>
    IsSuperAdmin || IsAdmin || UnitIds.Contains(unitId);
```

---

## 7. Mudanças no Fluxo de Convite (InviteUser)

### 7.1 InviteUserViewModel

```csharp
public record InviteUserViewModel(
    string FullName,
    string Email,
    UserRole Role,
    Guid OrganizationId,
    List<Guid>? UnitIds);   // NOVO — obrigatório para roles operacionais
```

### 7.2 InviteUserViewModelValidator

Nova regra:

```
RuleFor(x => x.UnitIds)
    .NotEmpty()
    .When(x => x.Role is Pharmacist or StockManager or ReceivingOperator)
    .WithMessage("At least one unit must be assigned for this role.")
```

### 7.3 InviteUserCommandHandler — fluxo atualizado

```
1. Validar input (FluentValidation)
2. Guards de autorização (já existem)
3. Verificar organização existe
4. Verificar email único
5. Se UnitIds informados:
   a. Verificar que todas as Units existem e pertencem à org
   b. Verificar que nenhuma unit está inativa
6. Criar user no Supabase (já existe)
7. Criar UserProfile (sem UnitId)
8. Para cada UnitId: criar UserUnit
9. SaveChangesAsync (tudo na mesma transação)
```

**Validação cross-entity no handler (passo 5):**
```csharp
if (vm.UnitIds?.Any() == true)
{
    var validUnitCount = await unitOfWork.Units
        .CountAsync(u => vm.UnitIds.Contains(u.Id) && u.IsActive, ct);

    if (validUnitCount != vm.UnitIds.Count)
        throw new BusinessLogicException(ValidationMessages.UnitNotFoundOrInactive);
}
```

### 7.4 UserViewModel

```csharp
public record UserViewModel(
    Guid Id,
    string FullName,
    string Email,
    string Role,
    Guid OrganizationId,
    IReadOnlyList<Guid> UnitIds,   // substituiu UnitId (nullable Guid)
    DateTime CreatedAt,
    bool IsActive);
```

---

## 8. Features de Unit (Application Layer)

### 8.1 CRUD de Unit

| Handler | Input | Autorização |
|---------|-------|-------------|
| `CreateUnitCommandHandler` | `CreateUnitViewModel` | Admin |
| `GetUnitByIdQuery` | `Guid id` | All |
| `GetAllUnitsQuery` | — | All |
| `UpdateUnitCommandHandler` | `Guid id` + `UpdateUnitViewModel` | Admin |
| `DeactivateUnitCommandHandler` | `Guid id` | Admin |

**CreateUnitViewModel:**
```csharp
public record CreateUnitViewModel(
    string Name,
    string Code,
    string? Address,
    string? Phone);
```

**UpdateUnitViewModel:**
```csharp
public record UpdateUnitViewModel(
    string Name,
    string Code,
    string? Address,
    string? Phone);
```

**UnitViewModel:**
```csharp
public record UnitViewModel(
    Guid Id,
    string Name,
    string Code,
    string? Address,
    string? Phone,
    Guid OrganizationId,
    DateTime CreatedAt,
    bool IsActive)
{
    public static Expression<Func<Unit, UnitViewModel>> FromEntity => ...;
    public static UnitViewModel From(Unit u) => ...;
}
```

**Validações no handler (CreateUnit):**
- Code único por org: verificar `user_units` antes de criar
- Organização ativa

### 8.2 Gerenciamento de User-Unit

| Handler | Endpoint | Autorização |
|---------|----------|-------------|
| `AssignUserToUnitCommandHandler` | `POST /api/units/{unitId}/users/{userId}` | Admin |
| `RemoveUserFromUnitCommandHandler` | `DELETE /api/units/{unitId}/users/{userId}` | Admin |
| `GetUnitUsersQuery` | `GET /api/units/{unitId}/users` | Admin, ou membro da unit |

**AssignUserToUnit — fluxo:**
```
1. Verificar unit existe e está ativa (scoped à org)
2. Verificar user existe e pertence à mesma org
3. Verificar user não é SuperAdmin (SuperAdmin não tem restrição de unit)
4. Verificar vínculo ativo não existe — se existe ativo: 409 Conflict
   (vínculos inativos históricos são mantidos — o novo registro é sempre criado do zero)
5. Criar UserUnit
6. SaveChangesAsync
```

**RemoveUserFromUnit — fluxo:**
```
1. Buscar UserUnit ativo para (UnitId, UserId)
2. Se não encontrado: 404
3. Verificar se user ainda terá units ativas após remoção:
   - Contar UserUnits ativas para o UserId (excluindo a atual)
   - Se role operacional (Pharmacist, StockManager, ReceivingOperator) E count == 0: 400
     "Cannot remove the user's last active unit assignment."
4. userUnit.Deactivate()
5. SaveChangesAsync
```

---

## 9. Endpoints — UnitsController

```
POST   /api/units                          → CreateUnit           [Admin]
GET    /api/units/{id}                     → GetUnitById          [All]
GET    /api/units                          → GetAllUnits          [All]
PUT    /api/units/{id}                     → UpdateUnit           [Admin]
DELETE /api/units/{id}                     → DeactivateUnit       [Admin]

POST   /api/units/{unitId}/users/{userId}  → AssignUserToUnit     [Admin]
DELETE /api/units/{unitId}/users/{userId}  → RemoveUserFromUnit   [Admin]
GET    /api/units/{unitId}/users           → GetUnitUsers         [Admin]
```

---

## 10. Migration

Uma única migration cobre todas as mudanças:

```
Nome: AddUnits_UserUnits_RemoveUserProfileUnitId

Operações:
  + CREATE TABLE units (...)
  + CREATE TABLE user_units (...)
  + CREATE UNIQUE INDEX IX_units_OrganizationId_Code ON units (OrganizationId, Code)
  + CREATE UNIQUE INDEX IX_user_units_UserId_UnitId ON user_units (UserId, UnitId)
  - DROP COLUMN unit_id FROM user_profiles
```

**Nota:** Verificar se há dados em `user_profiles.unit_id` antes de aplicar. Em ambiente de desenvolvimento com seed apenas, drop direto é seguro.

---

## 11. IUnitOfWork — DbSets a adicionar

```csharp
DbSet<Unit> Units { get; }
DbSet<UserUnit> UserUnits { get; }
```

---

## 12. Roles Constants — verificar

```csharp
// SIM.Domain/Constants/Roles.cs
// Verificar se Roles.Admin existe como constante isolada
// (hoje temos Roles.AdminOrStockManager e similares)
// Necessário para o [Authorize(Roles = Roles.Admin)] nos endpoints de Unit
```

---

## 13. Ordem de Implementação

```
1.  Domain:          Unit entity
2.  Domain:          UserUnit entity
3.  Domain:          UserProfile — remover UnitId
4.  Domain:          SimClaimTypes — adicionar UnitIds
5.  Infrastructure:  UnitConfiguration
6.  Infrastructure:  UserUnitConfiguration
7.  Infrastructure:  UserProfileConfiguration — remover coluna UnitId
8.  Infrastructure:  ApplicationDbContext — adicionar DbSets
9.  Infrastructure:  IUnitOfWork — adicionar DbSets
10. Infrastructure:  Migration (AddUnits_UserUnits_RemoveUserProfileUnitId)
11. WebApi:          SupabaseClaimsTransformation — query UnitIds
12. Application:     ICurrentUserService — adicionar IsAdmin, UnitIds, HasAccessToUnit
13. WebApi:          CurrentUserService — implementar novos membros
14. Application:     UnitViewModel (com FromEntity + From)
15. Application:     CreateUnitViewModelValidator
16. Application:     Unit CRUD handlers
17. Application:     UserUnit handlers (Assign, Remove, GetUnitUsers)
18. Application:     InviteUserViewModel — substituir UnitId por UnitIds
19. Application:     InviteUserViewModelValidator — nova regra operacional
20. Application:     InviteUserCommandHandler — criar UserUnits na transação
21. Application:     UserViewModel — substituir UnitId por UnitIds
22. Application:     GetUserByIdQuery — projetar UnitIds
23. WebApi:          UnitsController
```
