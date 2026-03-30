# Azure Deploy — Source of Truth

Este documento descreve o processo completo de deploy de uma aplicação na Azure usando **free tier**, com foco em segurança. Serve como referência para este projeto e para qualquer outro com stack similar (.NET API + React SPA).

---

## Arquitetura de Deploy

```
GitHub (main branch)
    │
    ├── push em backend/**  ──►  CD Backend  ──►  Azure App Service (F1)
    │
    └── push em frontend/** ──►  CD Frontend ──►  Azure Static Web Apps (Free)
                                                        │
                                                        └── CDN Global + SSL automático
```

**Banco de dados e Auth** (Supabase) ficam fora da Azure — são serviços externos já na nuvem.

---

## Escolhas e Justificativas

| Recurso | Tier | Por que |
|---|---|---|
| **App Service** | F1 (Free) | Custo zero garantido. 60 min CPU/dia. Para MVP/baixo tráfego. |
| **Static Web Apps** | Free | Sem limitações práticas para SPA. CDN global, SSL gratuito, 100 GB bandwidth/mês. |
| **Container Apps** | ❌ Evitar no free | Tem concessão mensal gratuita, mas pode cobrar se ultrapassar. |
| **Resource Group** | Gratuito | Container lógico. Sem custo. Agrupa todos os recursos. |

> **Regra de ouro**: App Service F1 nunca cobra. Container Apps pode cobrar. Se o critério é custo zero garantido, use App Service F1.

---

## Fase 1 — Conta e Subscription Azure

Se for a primeira vez usando a Azure:

1. Acessa [portal.azure.com](https://portal.azure.com)
2. Escolhe **"Try Azure for free"** (Azure free account):
   - Cartão de crédito só para verificação de identidade — **não é cobrado** durante 30 dias
   - $200 de crédito como buffer de segurança
   - App Service F1 e Static Web Apps são **"always-free"** — continuam grátis após os 30 dias
3. Após criar a conta, a subscription já aparece automaticamente no portal

---

## Fase 2 — Criar Recursos no Portal Azure

### 2.1 — Resource Group

1. Portal → pesquisa **"Resource groups"** → **Create**
2. Preenche:
   - **Resource group name**: `rg-<projeto>-prod` (ex: `rg-sim-prod`)
   - **Region**: `Brazil South` ou `East US`
3. **Review + create** → **Create**

---

### 2.2 — App Service (Backend .NET)

1. Portal → **"App Services"** → **Create** → **Web App**
2. Preenche:

| Campo | Valor |
|---|---|
| Resource group | `rg-<projeto>-prod` |
| Name | `<projeto>-api` *(globalmente único)* |
| Publish | `Code` |
| Runtime stack | `.NET 10 (STS)` ou a versão do projeto |
| OS | `Linux` |
| Region | Mesma do Resource Group |

3. Em **App Service Plan** → **Create new**:
   - Name: `asp-<projeto>-free`
   - Pricing plan: **Free F1**
4. **Review + create** → **Create**

> Após criar, a URL ficará no formato: `https://<nome>-<hash>.<região>-01.azurewebsites.net`

---

### 2.3 — Habilitar Basic Auth (necessário para Publish Profile)

Por padrão, a Azure desativa basic auth. Para habilitar:

1. App Service → **Settings** → **Configuration** → aba **General settings**
2. Scroll até **SCM Basic Auth Publishing Credentials** → **On**
3. **Save**

---

### 2.4 — Configurar Variáveis de Ambiente do Backend

App Service → **Settings** → **Environment variables** → aba **App settings**

> **Sintaxe Azure**: hierarquia JSON usa `__` (duplo underscore) em vez de `:`.
> `ConnectionStrings:DefaultConnection` → `ConnectionStrings__DefaultConnection`

Adicionar as seguintes variáveis:

| Name | Value |
|---|---|
| `ASPNETCORE_ENVIRONMENT` | `Production` |
| `ConnectionStrings__DefaultConnection` | *connection string do banco* |
| `Supabase__Url` | *URL do projeto Supabase* |
| `Supabase__AnonKey` | *Anon key do Supabase* |
| `Cors__AllowedOrigins__0` | *URL do Static Web App (preencher após criá-lo)* |

> **Segurança**: nunca coloque secrets em `appsettings.json`. Sempre use variáveis de ambiente da Azure ou Azure Key Vault.

Clica **Apply** → **Confirm** após adicionar todas.

---

### 2.5 — Static Web App (Frontend React/Vite)

1. Portal → **"Static Web Apps"** → **Create**
2. Preenche:

| Campo | Valor |
|---|---|
| Resource group | `rg-<projeto>-prod` |
| Name | `<projeto>-frontend` |
| Plan type | **Free** |
| Source | `GitHub` |

3. Conecta ao GitHub (autoriza via OAuth)
4. Preenche:
   - **Organization**: tua organização
   - **Repository**: nome do repositório
   - **Branch**: `main`
5. Em **Build Details**:
   - **Build Presets**: `React`
   - **App location**: `/frontend` *(pasta raiz do projeto Vite)*
   - **Api location**: *(vazio)*
   - **Output location**: `dist`
6. **Review + create** → **Create**

> A Azure abrirá um PR automático no repositório com um workflow YAML gerado. Aceita e faz merge desse PR.

Após criar, copia a URL gerada em **Overview** (ex: `https://yellow-forest-0ad5d710f.azurestaticapps.net`) e usa no campo `Cors__AllowedOrigins__0` do App Service.

---

### 2.6 — Baixar Publish Profile do App Service

1. App Service → **Overview**
2. Clica **Download publish profile**
3. Guarda o arquivo `.PublishSettings` — o conteúdo XML completo vai para um GitHub Secret

---

## Fase 3 — GitHub Secrets

**Settings** → **Secrets and variables** → **Actions** → **New repository secret**

### Secrets necessários

| Secret | Valor | Descrição |
|---|---|---|
| `AZURE_WEBAPP_NAME` | nome do App Service (ex: `sim-api-prod`) | Nome exato conforme o portal Azure |
| `AZURE_WEBAPP_PUBLISH_PROFILE` | conteúdo XML completo do `.PublishSettings` | Credencial de deploy do App Service |
| `VITE_API_URL` | URL completa do App Service (com `https://`) | Injetada no build do frontend |

> **Segurança**: o nome do App Service (`AZURE_WEBAPP_NAME`) também fica em secret para não expor infraestrutura no código.

O token do Static Web Apps (`AZURE_STATIC_WEB_APPS_API_TOKEN_...`) é criado automaticamente pela Azure no momento da criação do recurso — não precisa criar manualmente.

---

## Fase 4 — Workflows de CI/CD

### Estratégia de branches

| Evento | Workflow | O que faz |
|---|---|---|
| Push/PR em `main` ou `Development` | CI Backend | Build + test |
| Push/PR em `main` ou `Development` | CI Frontend | Build (verifica compilação) |
| Push em `main` | **CD Backend** | Build + publish + deploy no App Service |
| Push em `main` | **CD Frontend** | Build + deploy no Static Web App |

> CI roda em ambas as branches. Deploy só ocorre em `main`.

---

### cd-backend.yml

```yaml
name: CD Backend

on:
  push:
    branches: [main]
    paths:
      - 'backend/**'
      - '.github/workflows/cd-backend.yml'

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup .NET
        uses: actions/setup-dotnet@v4
        with:
          dotnet-version: '10.x'

      - name: Restore
        run: dotnet restore backend/SIM.slnx

      - name: Build
        run: dotnet build backend/SIM.slnx --no-restore --configuration Release

      - name: Publish
        run: dotnet publish backend/SIM.WebApi/SIM.WebApi.csproj --configuration Release --output ./publish

      - name: Deploy to Azure App Service
        uses: azure/webapps-deploy@v3
        with:
          app-name: ${{ secrets.AZURE_WEBAPP_NAME }}
          publish-profile: ${{ secrets.AZURE_WEBAPP_PUBLISH_PROFILE }}
          package: ./publish
```

---

### azure-static-web-apps-*.yml (gerado pela Azure, com ajuste)

O arquivo é gerado automaticamente pela Azure. O único ajuste necessário é passar o `VITE_API_URL` no step de build:

```yaml
- name: Build And Deploy
  uses: Azure/static-web-apps-deploy@v1
  env:
    VITE_API_URL: ${{ secrets.VITE_API_URL }}   # ← adicionar isto
  with:
    azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN_... }}
    repo_token: ${{ secrets.GITHUB_TOKEN }}
    action: "upload"
    app_location: "./frontend"
    api_location: ""
    output_location: "dist"
```

---

### ci-frontend.yml (ajuste para o build não falhar)

O CI também precisa do `VITE_API_URL` para que o build de verificação não quebre:

```yaml
- name: Build
  working-directory: frontend
  env:
    VITE_API_URL: ${{ secrets.VITE_API_URL }}   # ← adicionar isto
  run: npm run build
```

---

## Fase 5 — Primeiro Deploy

1. Faz commit e push de todos os workflows para `Development`
2. Abre PR de `Development` → `main`
3. Faz merge
4. Acompanha os workflows em **Actions** no GitHub
5. Verifica os deploys:
   - Backend: `https://<nome-app>.azurewebsites.net/scalar` (docs da API)
   - Frontend: `https://<nome>.azurestaticapps.net`

---

## Segurança — Checklist

### Secrets e configuração
- [ ] Nenhum secret, connection string ou API key no código-fonte ou nos arquivos YAML
- [ ] Todas as variáveis sensíveis configuradas como GitHub Secrets ou Azure Environment Variables
- [ ] `appsettings.json` contém apenas estrutura com valores vazios — nunca valores reais
- [ ] `appsettings.Development.json` está no `.gitignore`

### Azure
- [ ] Basic Auth desativado após configurar CI/CD (pode ser reativado só quando necessário para baixar novo publish profile)
- [ ] CORS configurado com a URL exata do frontend — nunca `*` em produção
- [ ] `ASPNETCORE_ENVIRONMENT` definido como `Production`
- [ ] Nenhum recurso com acesso público desnecessário

### GitHub
- [ ] Secrets nunca logados em outputs de workflows
- [ ] Branch `main` protegida (requer PR + CI verde antes de merge)
- [ ] CD só dispara em `main`, nunca em `Development`

### Proteção da branch main (recomendado)

Em **Settings** → **Branches** → **Add branch ruleset**:
- Require a pull request before merging
- Require status checks to pass (CI Backend, CI Frontend)
- Do not allow bypassing the above settings

---

## Limitações do Free Tier (App Service F1)

| Limitação | Valor | Impacto |
|---|---|---|
| CPU | 60 min/dia | Suficiente para MVP com baixo tráfego |
| RAM | 1 GB | Suficiente para .NET API simples |
| Cold start | ~5-10s após inatividade | App dorme após ~20 min sem requests |
| Custom domain SSL | Não disponível | URL fica em `*.azurewebsites.net` |
| Always On | Não disponível | Apenas planos pagos |

> Quando o produto for para produção real, migrar para **B1** (~$13/mês) que remove todas essas limitações.

---

## Troubleshooting

| Problema | Causa | Solução |
|---|---|---|
| "Download publish profile — Basic authentication is disabled" | Basic auth desativado por padrão | App Service → Configuration → General settings → SCM Basic Auth → On |
| Build do frontend falha com `Missing VITE_API_URL` | Secret não configurado ou não passado no step | Verificar GitHub Secret `VITE_API_URL` e o `env:` no step de build |
| Deploy do backend falha com 403 | Publish profile incorreto ou expirado | Baixar novo publish profile e atualizar o secret |
| CORS error no frontend | URL do frontend não está na lista de CORS do backend | Atualizar `Cors__AllowedOrigins__0` no App Service com a URL correta |
| App Service retorna 503 | Cold start ou limite de CPU atingido | Aguardar ~10s ou verificar consumo no portal Azure |
