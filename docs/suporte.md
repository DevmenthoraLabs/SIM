# SIM Suporte — Onboarding e Administração Interna

Este documento descreve os fluxos e decisões da área de suporte interno do SIM.
Os endpoints da área Suporte são exclusivos para a equipe interna (role `SuperAdmin`) e **nunca devem ser expostos a clientes finais**.

---

## Por que existe uma área "Suporte"?

O SIM é um produto SaaS multi-tenant. Uma organização (ex: FarmaVida) não existe no sistema antes de ser cadastrada — e alguém precisa fazer esse cadastro inicial. Esse papel pertence à equipe de suporte/vendas do SIM, que opera com o role `SuperAdmin`.

O `SuperAdmin` é diferente do `Admin`:

| | `SuperAdmin` | `Admin` |
|---|---|---|
| **Quem é** | Equipe interna SIM | Gestor da farmácia cliente |
| **Escopo** | Todas as organizations | Apenas a própria organization |
| **Pode criar orgs** | Sim | Não |
| **Pode criar usuários** | Sim, qualquer role, qualquer org | Sim, apenas dentro da própria org |
| **Pertence a uma org** | Não (`OrganizationId` = null) | Sim |
| **Endpoints disponíveis** | `/api/suporte/*` + `/api/*` (como qualquer autenticado) | `/api/*` (com restrições de escopo) |

---

## Estratégia Multi-Tenant

O SIM usa **single database, multi-tenant**. Todas as organizations compartilham o mesmo banco de dados PostgreSQL (Supabase), separadas pela coluna `OrganizationId` em cada tabela de negócio.

**Não existe um banco separado por cliente.** A isolação é garantida por lógica de aplicação — cada usuário autenticado só acessa dados da sua própria organização.

**Todo usuário pertence a uma organização** — sem exceção. SuperAdmins pertencem à organização interna **SIM Suporte** (`id: 00000000-0000-0000-0000-000000000001`), que é seedada na migration inicial e nunca aparece para clientes. A constante `SystemOrganizations.SimSuporte` no Domain representa este UUID.

Essa é a estratégia padrão de SaaS (adotada por Notion, Linear, GitHub etc.) e é a correta para o MVP. Permite crescimento sem custo operacional de múltiplas instâncias.

---

## Como o Supabase é Usado

Cada ambiente (dev, staging, produção) usa um **projeto Supabase separado**. Cada projeto tem sua própria URL, chaves de API, banco de dados e instância de autenticação. As credenciais de cada ambiente ficam em variáveis de ambiente / `dotnet user-secrets` — nunca no código.

A identidade dos usuários é gerenciada pelo **Supabase Auth** (email, senha, sessões). O SIM gerencia apenas o **perfil de negócio** (role, organização). Os dois sistemas se conectam pelo UUID do usuário (`auth.users.id` = `UserProfile.Id`).

---

## Endpoints da Área Suporte

Todos requerem `Authorization: Bearer {token}` de um usuário com role `SuperAdmin`.
Agrupados como **"SIM Suporte"** no Scalar UI.

### Organizations

| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/api/suporte/organizations` | Cria nova organization |
| `GET`  | `/api/suporte/organizations` | Lista todas as organizations |
| `GET`  | `/api/suporte/organizations/{id}` | Busca organization por ID |

### Users

| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/api/suporte/users` | Provisiona qualquer UserProfile (qualquer role, qualquer org) |
| `GET`  | `/api/suporte/users/{id}` | Busca UserProfile por ID |

---

## Workflow de Onboarding de um Novo Cliente

Exemplo: a farmácia **FarmaVida** adquire uma assinatura do SIM.

### Pré-requisito: ter um SuperAdmin ativo

Se ainda não existe nenhum SuperAdmin, siga a seção [Bootstrap do Primeiro SuperAdmin](#bootstrap-do-primeiro-superadmin) abaixo.

### Passo 1 — Criar a Organization

```http
POST /api/suporte/organizations
Authorization: Bearer {token_superadmin}

{
  "name": "FarmaVida",
  "cnpj": "12345678000195",
  "type": "Private"
}
```

Guarde o `id` retornado — ele é o `organizationId` dos próximos passos.

### Passo 2 — Criar o usuário Admin no Supabase

No dashboard do Supabase (Authentication → Users → Add user → Create new user):
- Informe o email e senha do gestor da FarmaVida
- Copie o **User UID** gerado (ex: `a1b2c3d4-5e6f-...`)

### Passo 3 — Provisionar o UserProfile do Admin

```http
POST /api/suporte/users
Authorization: Bearer {token_superadmin}

{
  "supabaseUserId": "a1b2c3d4-5e6f-...",
  "fullName": "João Silva",
  "email": "joao@farmavida.com",
  "role": "Admin",
  "organizationId": "{id-da-farmavida}",
  "unitId": null
}
```

### Passo 4 — Entregar as credenciais ao cliente

Passe para o gestor da FarmaVida:
- Email e senha criados no Passo 2
- URL da API e documentação do Scalar

### Passo 5 — O Admin da FarmaVida gerencia seus próprios usuários

O `Admin` da FarmaVida agora pode criar os demais usuários da sua farmácia via `POST /api/users`. Ele **só pode criar usuários dentro da sua própria organização** — a restrição é aplicada automaticamente pelo `UserAppService`.

---

## Cadastro de SuperAdmins

Ver o documento interno **[superadmin-onboarding.md](superadmin-onboarding.md)** para o processo completo, incluindo bootstrap do primeiro SuperAdmin e adição de novos membros da equipe.

---

## Regras de Negócio Aplicadas Automaticamente

| Regra | Onde é aplicada |
|-------|-----------------|
| Apenas `SuperAdmin` acessa `/api/suporte/*` | `[Authorize(Roles = Roles.SuperAdmin)]` nos controllers |
| `Admin` só cria usuários na própria org | `UserAppService.CreateAsync` verifica `currentUserService.OrganizationId` |
| `Admin` não pode atribuir role `SuperAdmin` | `UserAppService.CreateAsync` rejeita com `403`-equivalent |
| `OrganizationId` obrigatório para todos os usuários | `CreateUserViewModelValidator` + `UserProfile.Create()` — sem exceções |
| SuperAdmins usam a org SimSuporte (`00000000-0000-0000-0000-000000000001`) | `SystemOrganizations.SimSuporte` no Domain; seedado pela migration `SeedSimSuporteOrganization` |
| `OrganizationId` da claim é injetado em todo request | `SupabaseClaimsTransformation` adiciona `sim:organization_id` |
