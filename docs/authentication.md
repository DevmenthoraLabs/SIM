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

O usuário autentica via Supabase (frontend ou Postman). O JWT retornado **já contém `sim_role` e `sim_organization_id`** injetados pelo Custom Access Token Hook. A API valida o JWT e aplica as permissões diretamente a partir das claims — sem consulta adicional ao banco.

Para o workflow completo de onboarding de um novo cliente, ver [suporte.md](suporte.md).

---

## Custom Access Token Hook

O Supabase possui um hook nativo que executa uma função PostgreSQL **a cada geração de JWT** (login e refresh). O SIM usa esse mecanismo para embutir as claims de negócio diretamente no token assinado.

A função está em `Docs/supabase-access-token-hook.sql` e deve ser registrada em **Authentication → Hooks → Custom Access Token Hook** no dashboard do Supabase.

**O que o hook faz:**
1. Recebe o evento de geração de token com `user_id`, `claims` e `authentication_method`
2. Consulta `user_profiles` pelo `user_id`
3. Injeta `sim_role` e `sim_organization_id` como claims top-level no JWT
4. Retorna `{ "claims": { ... } }` com as claims enriquecidas

**JWT resultante após o hook:**
```json
{
  "sub":                 "user-uuid",
  "role":                "authenticated",
  "sim_role":            "Admin",
  "sim_organization_id": "org-uuid",
  "exp":                 1234567890
}
```

Como o JWT é assinado com RS256 pelo Supabase, essas claims **não podem ser forjadas** por nenhum cliente.

---

## Claims Transformation

A cada requisição autenticada, `SupabaseClaimsTransformation` mapeia as claims do JWT para o pipeline do ASP.NET Core:

1. JWT Bearer valida a assinatura RS256 via OIDC discovery
2. `SupabaseClaimsTransformation` lê `sim_role` e `sim_organization_id` do JWT já validado
3. Injeta no `ClaimsPrincipal`:
   - `ClaimTypes.Role` → valor de `sim_role` (ex: `"Admin"`)
   - `sim:organization_id` → valor de `sim_organization_id`
4. `[Authorize(Roles = "Admin")]` passa a funcionar nativamente
5. `ICurrentUserService.OrganizationId` e `ICurrentUserService.IsSuperAdmin` ficam disponíveis nos AppServices

**Nenhuma query ao banco é feita por requisição.** Role e organização estão no token.

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
