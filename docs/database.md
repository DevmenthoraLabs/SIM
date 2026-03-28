# Banco de Dados & Supabase

## Visão Geral

SIM usa **Supabase** como plataforma de banco de dados (PostgreSQL gerenciado) e autenticação. A conexão com o banco é feita via **Session Mode Pooler** (PgBouncer) usando um role dedicado `sim_api`.

---

## Setup do Projeto Supabase

> Cada desenvolvedor usa o **mesmo projeto Supabase** do time.
> Peça as credenciais ao Tech Lead e vá direto para [Configuração Local](configuration.md).
> Siga os passos abaixo apenas se estiver criando um projeto do zero.

### 1. Criar o projeto

Acesse [supabase.com](https://supabase.com), crie uma conta e um novo projeto. Anote a região (ex: `sa-east-1`).

### 2. Criar o role `sim_api`

No dashboard: **SQL Editor → New query**. Execute:

```sql
CREATE ROLE sim_api WITH LOGIN PASSWORD 'senha-forte-sem-caracteres-especiais';

GRANT CONNECT ON DATABASE postgres TO sim_api;
GRANT USAGE ON SCHEMA public TO sim_api;

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO sim_api;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO sim_api;
```

> Evite `;`, `=`, `@`, `%`, `&` na senha — eles quebram a connection string.

### 3. Coletar credenciais

| O que | Onde no dashboard |
|-------|------------------|
| **Project URL** | Settings → Data API → Project URL |
| **Anon/Publishable Key** | Connect → API Keys → Publishable Key |
| **Session Pooler (app)** | Settings → Database → Connection Pooler → Session mode → .NET |
| **Direct Connection (migrations)** | Settings → Database → Connection string → .NET |

A connection string do **pooler** (para o app em runtime):
```
User Id=sim_api.[ref];Password=SENHA_SIM_API;Server=aws-0-REGIAO.pooler.supabase.com;Port=5432;Database=postgres
```

A connection string **direta** (para migrations — usa `postgres`, não `sim_api`):
```
User Id=postgres.[ref];Password=SENHA_POSTGRES;Server=aws-0-REGIAO.supabase.com;Port=5432;Database=postgres
```

> A senha do `postgres` está em: **Settings → Database → Database password**.

---

## Por Que Só Uma Connection String no App

O app usa exclusivamente o **Session Mode Pooler** em runtime. A Direct Connection do Supabase (que bypassa o PgBouncer) só suporta IPv6 em projetos recentes — o que a torna inacessível na maioria das redes locais. Migrations são aplicadas via SQL Script diretamente no SQL Editor do Supabase, sem necessidade de conexão direta pela máquina do dev.

---

## Migrations

### Criar uma nova migration (ao modificar entidades)

Na raiz do repositório:

```bash
dotnet ef migrations add NomeDescritivo \
  --project SIM.Infrastructure \
  --startup-project SIM.WebApi
```

Exemplos de nomes: `AddProductCategory`, `AddUnitEntity`, `SeedSimSuporteOrganization`.

### Aplicar migrations — SQL Script (único método suportado)

A Direct Connection do Supabase expõe apenas IPv6 em projetos mais recentes, o que é incompatível com a maioria das redes locais. Por isso, **`dotnet ef database update` não funciona de forma confiável** contra o Supabase. O método correto é sempre via SQL Script.

**Passo 1 — Gerar o script SQL**

```bash
dotnet ef migrations script \
  --project SIM.Infrastructure \
  --startup-project SIM.WebApi \
  --output migration.sql \
  --idempotent
```

A flag `--idempotent` faz o script verificar `__EFMigrationsHistory` antes de cada migration — seguro para reexecutar sem criar dados duplicados ou conflitos. Se uma migration já foi aplicada, ela é pulada automaticamente.

**Passo 2 — Executar no Supabase**

1. Abra `migration.sql` gerado na raiz do projeto
2. Copie o conteúdo
3. No dashboard: **SQL Editor → New query**
4. Cole e clique em **Run**

> `migration.sql` está no `.gitignore` — não commitar. É um artefato derivado, gerado on-demand.

---

## O que commitar

| Arquivo | Git |
|---------|-----|
| `SIM.Infrastructure/Migrations/*.cs` | **Sim** — fonte da verdade |
| `migration.sql` | **Não** — artefato derivado, gerado on-demand |

---

## Notas sobre PgBouncer

O Supabase usa PgBouncer em **Session Mode** como pooler para o app em runtime. Dois comportamentos importantes:

- **`No Reset On Close=true`** — obrigatório na connection string do pooler. O Npgsql tenta resetar a conexão ao devolvê-la ao pool; o PgBouncer descarta o objeto antes disso. Esse parâmetro desativa o reset.
- **`No Reset On Close=true` na Direct Connection** — também recomendado por consistência, embora a conexão direta não passe pelo PgBouncer.
- **DDL em transações** — não suportado pelo PgBouncer. Por isso migrations nunca devem ser aplicadas via pooler.
