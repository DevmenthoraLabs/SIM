# Autenticação & Autorização

## Visão Geral

SIM usa **dois sistemas separados** para identidade e perfil de negócio.

```
┌──────────────────────────────────┐     ┌──────────────────────────────────────┐
│  SUPABASE AUTH (auth.users)      │     │  SIM DATABASE (public.user_profiles) │
│                                  │     │                                      │
│  id:    "a1b2c3d4-..."  ◄────────┼─────┤  Id:             "a1b2c3d4-..."      │
│  email: "user@sim.com"           │     │  FullName:        "User"             │
│  (senha, tokens, sessões)        │     │  Role:            Admin              │
│                                  │     │  OrganizationId:  "org-uuid..."      │
└──────────────────────────────────┘     └──────────────────────────────────────┘
         Supabase gerencia                        SIM gerencia
```

O Supabase Auth gerencia **autenticação** (quem você é). A API SIM gerencia **autorização e dados de negócio** (o que você pode fazer e a qual organização pertence). Os dois sistemas se conectam pelo UUID do usuário (`auth.users.id` = `UserProfile.Id`).

---

## JWT RS256 / OIDC

Projetos Supabase usam assinatura assimétrica RS256. A API valida tokens via OIDC discovery:

```
Authority = {supabaseUrl}/auth/v1
```

O endpoint `.well-known/openid-configuration` expõe a chave pública. **Não há nenhum secret de JWT para configurar localmente.**

O `ValidAudience` esperado é `"authenticated"` — claim padrão dos tokens Supabase.

---

## Fluxo de Adição de Usuário

Para adicionar um novo membro ao SIM são necessárias duas etapas: criar a identidade no Supabase e provisionar o perfil na API.

### Etapa 1 — Criar a identidade (no dashboard Supabase)

Acesse: **Authentication → Users → Add user → Create new user**

- Informe email e senha do usuário
- Copie o **User UID** gerado (ex: `a1b2c3d4-5e6f-...`)

### Etapa 2 — Provisionar o UserProfile (via API)

**SuperAdmin provisionando um Admin de nova org** (via `POST /api/suporte/users`):
```http
POST /api/suporte/users
Authorization: Bearer {token_superadmin}

{
  "supabaseUserId": "a1b2c3d4-5e6f-...",
  "fullName":       "João Silva",
  "email":          "joao@farmavida.com",
  "role":           "Admin",
  "organizationId": "uuid-da-organizacao",
  "unitId":         null
}
```

**Admin provisionando usuário da sua org** (via `POST /api/users`):
```http
POST /api/users
Authorization: Bearer {token_do_admin}

{
  "supabaseUserId": "a1b2c3d4-5e6f-...",
  "fullName":       "Maria Farmacêutica",
  "email":          "maria@farmavida.com",
  "role":           "Pharmacist",
  "organizationId": "uuid-da-organizacao",
  "unitId":         null
}
```

> O `organizationId` no segundo caso deve ser o da própria org do Admin — qualquer outro valor será rejeitado com `400`.

### Etapa 3 — Login normal

O usuário autentica via Supabase (frontend ou Postman). O JWT retornado contém o `sub` com o UUID. A API valida o JWT, carrega o `UserProfile` pelo UUID e aplica as permissões automaticamente.

Para o workflow completo de onboarding de um novo cliente, ver [suporte.md](suporte.md).

---

## Claims Transformation

A cada requisição autenticada:

1. JWT Bearer valida a assinatura via OIDC
2. `SupabaseClaimsTransformation` lê o `sub` do JWT (= `UserProfile.Id`)
3. Carrega o `UserProfile` do banco e injeta duas claims adicionais:
   - `ClaimTypes.Role` → valor do `UserProfile.Role` (ex: `"Admin"`)
   - `sim:organization_id` → UUID da organização do usuário (vazio para `SuperAdmin`)
4. `[Authorize(Roles = "Admin")]` passa a funcionar nativamente
5. `ICurrentUserService.OrganizationId` e `ICurrentUserService.IsSuperAdmin` ficam disponíveis nos AppServices para controle de escopo

A constante `SimClaimTypes.OrganizationId` (`"sim:organization_id"`) está definida em `SIM.WebApi/Auth/SimClaimTypes.cs`.

---

## Roles e Permissões

| Role | Quem é | OrganizationId | Acesso |
|------|--------|---------------|--------|
| `SuperAdmin` | Equipe interna SIM (suporte/vendas) | `null` | Endpoints `/api/suporte/*` + leitura geral |
| `Admin` | Gestor da farmácia cliente | Obrigatório | Gerencia usuários da própria org |
| `StockManager` | Responsável logístico | Obrigatório | Leitura de orgs, criação/leitura de produtos |
| `Pharmacist` | Operador de balcão | Obrigatório | Leitura de produtos |
| `ReceivingOperator` | Operador de recebimento | Obrigatório | Leitura de produtos |

As roles são definidas como constantes em `SIM.WebApi/Auth/Roles.cs` e aplicadas via `[Authorize(Roles = Roles.X)]` nos controllers.

> **SuperAdmin vs Admin:** `SuperAdmin` é exclusivo da equipe SIM e não pertence a nenhuma organização cliente. `Admin` é o gestor de uma farmácia específica, com escopo restrito à sua organização. Ver [suporte.md](suporte.md) para o fluxo de onboarding.
