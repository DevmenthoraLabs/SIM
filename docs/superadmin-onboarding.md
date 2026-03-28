# SuperAdmin — Cadastro e Onboarding

> **Documento interno — equipe SIM Suporte**
> Este documento descreve como adicionar novos membros à equipe de suporte com acesso SuperAdmin.
> Não compartilhar com clientes.

---

## O que é um SuperAdmin

SuperAdmin é o role exclusivo da equipe interna SIM (suporte e vendas). Diferente do `Admin` de uma farmácia cliente, o SuperAdmin:

- Pertence à organização interna **SIM Suporte** (`id: 00000000-0000-0000-0000-000000000001`)
- Tem acesso a todos os endpoints `/api/suporte/*`
- Pode criar e listar qualquer organização
- Pode provisionar usuários em qualquer organização com qualquer role
- Não tem escopo restrito a uma farmácia específica

---

## Pré-requisito: banco de dados inicializado

A organização SIM Suporte (`00000000-0000-0000-0000-000000000001`) deve existir no banco antes de qualquer SuperAdmin ser criado. Ela é inserida automaticamente pela migration `SeedSimSuporteOrganization`.

Para verificar:

```sql
SELECT id, name, cnpj FROM organizations WHERE id = '00000000-0000-0000-0000-000000000001';
```

Se não retornar nenhum registro, aplique as migrations primeiro. Ver [database.md](database.md).

---

## Cadastro do Primeiro SuperAdmin (bootstrap)

O primeiro SuperAdmin não pode ser criado via API — não existe token válido ainda. O processo é feito diretamente no banco via SQL Editor do Supabase.

### Passo 1 — Criar o usuário no Supabase Auth

No dashboard do Supabase:
**Authentication → Users → Add user → Create new user**

- **Email:** seu email corporativo (ex: `pedro@sim.com`)
- **Password:** senha forte
- Copie o **User UID** gerado (formato UUID, ex: `a1b2c3d4-5e6f-7890-abcd-ef1234567890`)

### Passo 2 — Inserir o UserProfile no banco

No **SQL Editor** do Supabase, execute substituindo os valores:

```sql
INSERT INTO user_profiles (id, full_name, email, role, organization_id, unit_id, created_at, updated_at, is_active)
VALUES (
    '<USER-UID-DO-PASSO-1>',
    'Seu Nome Completo',
    'seu@email.com',
    'SuperAdmin',
    '00000000-0000-0000-0000-000000000001',  -- SimSuporte org (fixo, nunca muda)
    NULL,
    NOW(),
    NULL,
    true
);
```

### Passo 3 — Verificar

Autentique via Supabase com o email/senha do Passo 1 e chame:

```http
GET /api/suporte/organizations
Authorization: Bearer {token}
```

Deve retornar `200 OK` com a lista de organizações (incluindo a SIM Suporte).

---

## Cadastro de Novos SuperAdmins (após o bootstrap)

Com um SuperAdmin já ativo, os próximos são criados via API — sem necessidade de acesso direto ao banco.

### Passo 1 — Criar o usuário no Supabase Auth

Mesmo processo do bootstrap: **Authentication → Users → Add user → Create new user**

Copie o **User UID** gerado.

### Passo 2 — Provisionar via API

```http
POST /api/suporte/users
Authorization: Bearer {token_de_um_superadmin_existente}
Content-Type: application/json

{
  "supabaseUserId": "<USER-UID-DO-PASSO-1>",
  "fullName": "Nome do Colega",
  "email": "colega@sim.com",
  "role": "SuperAdmin",
  "organizationId": "00000000-0000-0000-0000-000000000001",
  "unitId": null
}
```

> O `organizationId` deve ser **sempre** o UUID fixo da SimSuporte: `00000000-0000-0000-0000-000000000001`.

**Resposta esperada — 201 Created:**
```json
{
  "id": "<USER-UID>",
  "fullName": "Nome do Colega",
  "email": "colega@sim.com",
  "role": "SuperAdmin",
  "organizationId": "00000000-0000-0000-0000-000000000001",
  "unitId": null,
  "createdAt": "2026-03-28T00:00:00Z",
  "isActive": true
}
```

### Passo 3 — Confirmar acesso

O novo colega autentica com seu email/senha e testa qualquer endpoint `/api/suporte/*`.

---

## Referências

| UUID fixo da SimSuporte | `00000000-0000-0000-0000-000000000001` |
|---|---|
| Constante no código | `SystemOrganizations.SimSuporte` em `SIM.Domain/Constants/SystemOrganizations.cs` |
| Migration que insere a org | `SeedSimSuporteOrganization` |
| Endpoints disponíveis | Ver [api-reference.md](api-reference.md) — seção "SIM Suporte" |
| Workflow de onboarding de clientes | Ver [suporte.md](suporte.md) |
