# Code Standards

## Regras Gerais

- Nomenclatura **100% em inglês** — classes, métodos, variáveis, comentários, mensagens de validação
- **Primary Constructors** em todas as classes (C# 12+)
- **Sem MediatR** — AppServices são chamados diretamente pelos controllers
- **Sem AutoMapper** — mapeamento manual entre ViewModel ↔ Entity nos AppServices
- **Sem Data Annotations** — validações exclusivamente via FluentValidation
- **Enums** para qualquer campo com valores fixos — nunca `string` para representar estado ou tipo

---

## Camada Domain

### Entidades

- Construtores `private` — instanciação exclusivamente via factory method estático `Create()`
- `BaseEntity` auto-gera `Id` via `Guid.NewGuid()` — entidades que recebem o `Id` de fora **não herdam** `BaseEntity`
- Propriedades com `private set` — imutáveis após criação

```csharp
public sealed class Product : BaseEntity
{
    public string Name { get; private set; }

    private Product() { }

    public static Product Create(string name, string description) =>
        new() { Name = name, Description = description };
}
```

### Entidades Multi-Tenant

Toda entidade de negócio que pertence a uma organização **deve** implementar `IOrganizationScoped`:

```csharp
public class StockItem : BaseEntity, IOrganizationScoped
{
    public Guid OrganizationId { get; private set; }

    public static StockItem Create(..., Guid organizationId)
    {
        // organizationId vem do ICurrentUserService, nunca do caller externo
    }
}
```

Ao implementar a interface:
- O Global Query Filter é registrado automaticamente — leituras já ficam isoladas por org
- O `SaveChangesAsync` guard bloqueia writes com `OrganizationId` incorreto
- O AppService deve receber `organizationId` via `ICurrentUserService.OrganizationId`, não via ViewModel

Não implementar `IOrganizationScoped` em uma entidade multi-tenant é um erro de segurança. Ver [architecture.md](architecture.md) para detalhes do mecanismo.

---

### Exceções de Domínio

- `DomainValidationException` — violações de regras de negócio (422)
- `BusinessLogicException` — erros de lógica de aplicação (400)
- Nunca use exceções genéricas (`Exception`, `InvalidOperationException`) para fluxo de negócio

### Constantes de Validação

Mensagens de validação ficam em `SIM.Domain/Constants/ValidationMessages.cs` — nunca strings hardcoded nos validators.

---

## Camada Application

### ViewModels

- Objetos de entrada e saída da API são chamados `ViewModel` — nunca DTO, Request ou Response
- Implementados como `record` para imutabilidade
- Enums usados diretamente — nunca `string` para campos tipados

```csharp
public record CreateOrganizationViewModel(string Name, string Cnpj, OrganizationType Type);
```

### Validators

- Um validator por ViewModel, em `SIM.Application/Validators/`
- Use `IsInEnum()` para validar campos enum
- Mensagens de erro via `ValidationMessages`

```csharp
public class CreateOrganizationViewModelValidator : AbstractValidator<CreateOrganizationViewModel>
{
    public CreateOrganizationViewModelValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Type).IsInEnum();
    }
}
```

### AppServices

- Um AppService por agregado/entidade principal
- Interface em `SIM.Application/Abstractions/Services/`
- Mapeamento manual: ViewModel → Entity na criação, Entity → ViewModel no retorno
- Sem lógica de infraestrutura — dependências via interface (`IRepository<T>`, `IUnitOfWork`)

---

## Camada Infrastructure

- Repositórios implementam `IRepository<T>` genérico
- Configurações EF Core em classes separadas (`IEntityTypeConfiguration<T>`)
- `ValueGeneratedNever()` para entidades com `Id` externo (ex: `UserProfile`)
- Conexão exclusivamente via Session Mode Pooler do Supabase

---

## Camada WebApi

### Controllers

- Sem `try-catch` — erros tratados pelo `GlobalExceptionHandler`
- `[Authorize(Roles = Roles.X)]` para controle de acesso — nunca roles hardcoded como string
- Retornos consistentes: `201 Created` com objeto, `200 OK` com lista/objeto, `404 NotFound`
- Validação via FluentValidation integrado ao pipeline do ASP.NET Core — controllers não validam manualmente

```csharp
[HttpPost]
[Authorize(Roles = Roles.Admin)]
public async Task<IActionResult> Create(CreateOrganizationViewModel viewModel)
{
    var result = await _organizationAppService.CreateAsync(viewModel);
    return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
}
```

### Serialização

- `JsonStringEnumConverter` configurado globalmente — enums trafegam como string no JSON
- Sem configuração adicional por endpoint

---

## Padrões Proibidos

| Proibido | Use em vez disso |
|----------|-----------------|
| `AutoMapper` | Mapeamento manual no AppService |
| `MediatR` | Chamada direta ao AppService |
| `[Required]`, `[MaxLength]` | FluentValidation |
| `Enum.Parse(string)` sem `ignoreCase` | `IsInEnum()` no validator + enum no ViewModel |
| Strings hardcoded para roles | Constantes em `Roles.cs` |
| Strings hardcoded para mensagens de validação | `ValidationMessages` |
| `try-catch` nos controllers | `GlobalExceptionHandler` |
| DTO, Request, Response como sufixo | ViewModel |
| `OrganizationId` recebido via ViewModel em operações de escrita | `ICurrentUserService.OrganizationId` |
| Entidade multi-tenant sem `IOrganizationScoped` | Implementar a interface — filtro e guard automáticos |
