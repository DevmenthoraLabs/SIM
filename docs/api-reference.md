# API Reference

Todos os endpoints (exceto `/api/auth/login`) requerem `Authorization: Bearer {jwt_token}`.

---

## Auth

| Método | Rota | Auth |
|--------|------|------|
| `POST` | `/api/auth/login` | Público |

### POST /api/auth/login

Autentica um usuário e retorna o bearer token para uso nos demais endpoints.

```json
{
  "email": "usuario@sim.com",
  "password": "senha"
}
```

**Resposta — 200 OK**
```json
{
  "accessToken": "eyJ...",
  "tokenType": "bearer",
  "expiresIn": 3600
}
```

Use o `accessToken` no header `Authorization: Bearer {accessToken}` em todas as chamadas subsequentes.

---

## SIM Suporte *(SuperAdmin only)*

Endpoints exclusivos para a equipe interna SIM. Usados para onboarding de novos clientes e administração cross-organizacional. Ver [suporte.md](suporte.md) para o workflow completo.

### Organizations (Suporte)

| Método | Rota | Role |
|--------|------|------|
| `POST` | `/api/suporte/organizations` | SuperAdmin |
| `GET`  | `/api/suporte/organizations` | SuperAdmin |
| `GET`  | `/api/suporte/organizations/{id}` | SuperAdmin |

### POST /api/suporte/organizations

```json
{
  "name": "FarmaVida",
  "cnpj": "12345678000195",
  "type": "Private"
}
```

**Tipos válidos:** `Public`, `Private`

**Resposta — 201 Created**
```json
{
  "id": "uuid",
  "name": "FarmaVida",
  "cnpj": "12345678000195",
  "type": "Private",
  "createdAt": "2026-01-15T10:00:00Z",
  "isActive": true
}
```

### Users (Suporte)

| Método | Rota | Role |
|--------|------|------|
| `POST` | `/api/suporte/users` | SuperAdmin |
| `GET`  | `/api/suporte/users/{id}` | SuperAdmin |

### POST /api/suporte/users

Provisiona qualquer `UserProfile`. Usado para criar o primeiro `Admin` de uma nova org, ou novos `SuperAdmin` para a equipe SIM.

```json
{
  "supabaseUserId": "a1b2c3d4-5e6f-7890-abcd-ef1234567890",
  "fullName": "João Silva",
  "email": "joao@farmavida.com",
  "role": "Admin",
  "organizationId": "uuid-da-organizacao",
  "unitId": null
}
```

**Roles válidas:** `SuperAdmin`, `Admin`, `Pharmacist`, `StockManager`, `ReceivingOperator`

> Para criar um `SuperAdmin`, use `"role": "SuperAdmin"` e `"organizationId": "00000000-0000-0000-0000-000000000001"` (UUID fixo da SimSuporte). Ver [superadmin-onboarding.md](superadmin-onboarding.md).

**Resposta — 201 Created**
```json
{
  "id": "a1b2c3d4-5e6f-7890-abcd-ef1234567890",
  "fullName": "João Silva",
  "email": "joao@farmavida.com",
  "role": "Admin",
  "organizationId": "uuid-da-organizacao",
  "unitId": null,
  "createdAt": "2026-01-15T10:00:00Z",
  "isActive": true
}
```

---

## Organizations

| Método | Rota | Role |
|--------|------|------|
| `GET` | `/api/organizations/{id}` | Admin, StockManager |

---

## Users

| Método | Rota | Role |
|--------|------|------|
| `POST` | `/api/users` | Admin |
| `GET`  | `/api/users/{id}` | Admin |

### POST /api/users

Provisiona um `UserProfile` para um usuário já criado no Supabase Auth.
O `organizationId` deve ser o da organização do Admin autenticado — qualquer outro valor é rejeitado.
O `role` não pode ser `SuperAdmin` — use `/api/suporte/users` para isso.

```json
{
  "supabaseUserId": "a1b2c3d4-5e6f-7890-abcd-ef1234567890",
  "fullName": "Maria Farmacêutica",
  "email": "maria@farmavida.com",
  "role": "Pharmacist",
  "organizationId": "uuid-da-organizacao",
  "unitId": null
}
```

**Roles válidas aqui:** `Admin`, `Pharmacist`, `StockManager`, `ReceivingOperator`

**Resposta — 201 Created**
```json
{
  "id": "a1b2c3d4-5e6f-7890-abcd-ef1234567890",
  "fullName": "Maria Farmacêutica",
  "email": "maria@farmavida.com",
  "role": "Pharmacist",
  "organizationId": "uuid-da-organizacao",
  "unitId": null,
  "createdAt": "2026-01-15T10:00:00Z",
  "isActive": true
}
```

---

## Products

| Método | Rota | Role |
|--------|------|------|
| `POST` | `/api/products` | Admin, StockManager |
| `GET` | `/api/products` | Admin, StockManager, Pharmacist, ReceivingOperator |
| `GET` | `/api/products/{id}` | Admin, StockManager, Pharmacist, ReceivingOperator |

### POST /api/products

```json
{
  "name": "Dipirona 500mg",
  "description": "Analgésico e antipirético"
}
```

**Resposta — 201 Created**
```json
{
  "id": "uuid",
  "name": "Dipirona 500mg",
  "description": "Analgésico e antipirético",
  "createdAt": "2026-01-15T10:00:00Z",
  "isActive": true
}
```

---

## Erros

| Status | Quando |
|--------|--------|
| `400 Bad Request` | Erros de lógica de negócio (`BusinessLogicException`) |
| `401 Unauthorized` | Token ausente ou inválido |
| `403 Forbidden` | Role sem permissão para o endpoint |
| `404 Not Found` | Recurso não encontrado |
| `422 Unprocessable Entity` | Violação de regra de domínio (`DomainValidationException`) |
| `500 Internal Server Error` | Erro inesperado (logado no servidor) |

Todos os erros retornam o formato padrão **ProblemDetails** (RFC 7807):

```json
{
  "type": "https://tools.ietf.org/html/rfc7807",
  "title": "Bad Request",
  "status": 400,
  "detail": "Organization with this CNPJ already exists."
}
```

---

## Testando com Postman

### 1. Obter o JWT

`POST https://SEU_REF.supabase.co/auth/v1/token`

Headers:
- `apikey`: Anon/Publishable Key
- `Content-Type`: `application/json`

Body:
```json
{
  "email": "user@sim.com",
  "password": "senha",
  "grant_type": "password"
}
```

Salve o `access_token` como variável `{{token}}` no Postman.

### 2. Usar nos requests

Header em todos os requests:
```
Authorization: Bearer {{token}}
```
