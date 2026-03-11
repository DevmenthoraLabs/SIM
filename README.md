# SIM! Sistema de Infraestrutura para Medicamentos
Projeto para a secretaria de inovação, visando facilitar a distribuição de medicamentos publicos.

## Como rodar:
pra adicionar o seu banco é só usar o dotnet secrets, primeiro inicializamos ele com:

```bash
dotnet user-secrets init
```

Dps rodamos o set:

```bash
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "sua connection string aqui"
```

Vc pode ver se entrou certo fazendo o list
```bash
dotnet user-secrets list
```

exemplo meu com localdb:

```bash
ConnectionStrings:DefaultConnection = Server=(localdb)\MSSQLLocalDB;Database=SchoolDb;Trusted_Connection=True;MultipleActiveResultSets=true
```

agr vc da um Update-Database com o terminal de gerenciador de pacotes nuget com o projeto School.Infrastructure selecionado (já montei as migrations)
e já vai funcionar
