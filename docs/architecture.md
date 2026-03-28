# Arquitetura

## Visão Geral

SIM segue **Clean Architecture** com quatro camadas e dependências sempre apontando para dentro (Domain).

```
SIM.WebApi
    └── SIM.Application
            └── SIM.Domain
SIM.Infrastructure
    └── SIM.Application
    └── SIM.Domain
```

### Camadas

| Projeto | Responsabilidade |
|---------|-----------------|
| `SIM.Domain` | Entidades, interfaces de repositório, enums, exceções de domínio, constantes de validação |
| `SIM.Application` | AppServices, ViewModels, validadores (FluentValidation), interfaces de serviço |
| `SIM.Infrastructure` | EF Core + PostgreSQL, repositórios, configuração de autenticação JWT |
| `SIM.WebApi` | Controllers REST, configuração ASP.NET Core, middlewares, claims transformation |

---

## Decisões de Design

### Estratégia Multi-Tenant: Single Database

O SIM usa **single database, multi-tenant**. Todas as organizations (clientes) coexistem no mesmo banco PostgreSQL, separadas pela coluna `OrganizationId` em cada tabela de negócio. Não existe instância ou schema separado por cliente.

Essa é a abordagem padrão de SaaS (adotada por Notion, Linear, GitHub etc.) e foi a escolhida para o MVP porque:
- Custo operacional zero por novo cliente
- Migrations e deployments unificados
- Supabase tem um único projeto por ambiente (dev/staging/prod)

A isolação é garantida por lógica de aplicação: `UserAppService` verifica que `Admin` só opera dentro da sua organização. `SuperAdmin` (equipe interna SIM) é a única role sem escopo de organização.

Para escalar para schema-per-tenant ou database-per-tenant no futuro, o ponto de mudança é o `ApplicationDbContext` e o connection string — as camadas superiores não mudam.

### Por que existe o role `SuperAdmin`?

O SIM tem dois níveis de administração:

- **`SuperAdmin`** (equipe SIM): cria organizations e o primeiro Admin de cada cliente. Pertence à organização interna **SIM Suporte** (`SystemOrganizations.SimSuporte`). Acessa `/api/suporte/*`.
- **`Admin`** (gestor da farmácia): gerencia usuários dentro da sua própria organização. Acessa `/api/*` com restrições de escopo.

Essa separação evita que um gestor de farmácia crie organizations novas ou acesse dados de outros clientes. Ver [suporte.md](suporte.md) para o workflow de onboarding.

### Por que SuperAdmin pertence à organização SimSuporte?

`OrganizationId` é uma FK obrigatória em `user_profiles` — todo usuário precisa de uma organização. Em vez de tornar a coluna nullable (o que introduziria verificações condicionais em toda a codebase), o SuperAdmin pertence a uma organização de sistema com UUID fixo e bem-conhecido (`00000000-0000-0000-0000-000000000001`).

Vantagens desta abordagem:
- Nenhuma lógica condicional de `OrganizationId` nas validações ou no domain
- Constraint de FK sempre satisfeita
- A constante `SystemOrganizations.SimSuporte` torna a intenção explícita e auditável
- A org SimSuporte é seedada pela migration `SeedSimSuporteOrganization` — não depende de chamada de API

### Por que não há endpoint de Sign Up?

O cadastro de identidade é responsabilidade do Supabase Auth. A API SIM gerencia apenas o `UserProfile` — os dados de negócio (role, organização) que o Supabase não armazena. Isso mantém os sistemas desacoplados e abre caminho para uma futura API de licensing independente.

### Por que `UserProfile` não herda `BaseEntity`?

`BaseEntity` auto-gera o `Id` via `Guid.NewGuid()` no construtor. O `Id` do `UserProfile` é o UUID do `auth.users` do Supabase — ele vem de fora e é passado explicitamente para `UserProfile.Create(supabaseUserId, ...)`. No banco, o EF Core está configurado com `ValueGeneratedNever()` para essa propriedade.

### Por que JWT RS256 sem secret no config?

Projetos Supabase modernos usam assinatura assimétrica (RS256). A API valida tokens via OIDC discovery (`{supabaseUrl}/auth/v1/.well-known/openid-configuration`) — a chave privada nunca sai do Supabase. Não há nenhum secret de JWT para configurar localmente ou vazar.

### Por que migrations via SQL Editor?

O Supabase usa PgBouncer como pooler. O EF Core executa migrations dentro de transações DDL que o PgBouncer não suporta. A solução é gerar o script SQL com `dotnet ef migrations script` e executar no SQL Editor do Supabase. Ver [database.md](database.md) para o fluxo completo.

### Por que `No Reset On Close=true`?

O Npgsql envia um comando de reset ao devolver conexões ao pool. O PgBouncer descarta o objeto antes do reset completar. O parâmetro desativa esse comportamento e é obrigatório ao usar Npgsql com PgBouncer.

---

## Regras de Dependência

- `SIM.Domain` não referencia nenhum outro projeto do SIM.
- `SIM.Application` referencia apenas `SIM.Domain`.
- `SIM.Infrastructure` referencia `SIM.Domain` e `SIM.Application` (para implementar interfaces).
- `SIM.WebApi` referencia `SIM.Application` e `SIM.Infrastructure` (apenas para registro de DI).
- Nenhuma camada de negócio (`Domain`, `Application`) depende de frameworks externos (EF Core, ASP.NET Core).
