# Product Type Design — Composição vs. Herança

## Contexto

O MVP precisa suportar `Medication` como um tipo especial de `Product` (com campos regulatórios). A questão é: como modelar isso no domínio e no banco?

## Opções consideradas

### TPH (Table Per Hierarchy)
Herança em C# (`Medication : Product`), tabela única com coluna discriminadora.

**Problema:** Cada novo tipo adiciona colunas nullable em `products`. Com 3+ tipos, a tabela fica poluída e qualquer alteração nela tem blast radius alto.

### TPT (Table Per Type)
Herança em C# (`Medication : Product`), tabela separada para cada subtipo.

**Problema:** EF Core TPT gera SQL com múltiplos JOINs implícitos, inclusive para queries simples. Performance notoriamente ruim.

### Composição (recomendado)
`Product` é uma entidade concreta e universal. Detalhes específicos de cada tipo ficam em tabelas satélite com FK opcional.

## Modelo proposto

```
products
  id | name | product_type | bar_code | category_id | org_id | ...

medication_details          -- existe só se product_type = 'Medication'
  product_id (FK) | generic_name | active_ingredient | concentration | is_controlled | ...
```

Futuro sem tocar em `products`:
```
supplement_details
  product_id (FK) | dosage | ...
```

Em C#:

```csharp
public class Product : LifeCycleEntity, IOrganizationScoped
{
    public string Name { get; private set; }
    public ProductType Type { get; private set; }
    public string? BarCode { get; private set; }
    public Guid? CategoryId { get; private set; }
    public Guid OrganizationId { get; private set; }

    public MedicationDetails? MedicationDetails { get; private set; }
}

public class MedicationDetails
{
    public Guid ProductId { get; private set; }
    public string? GenericName { get; private set; }
    public string? ActiveIngredient { get; private set; }
    public string? Concentration { get; private set; }
    public bool IsControlled { get; private set; }
}
```

## Por que isso funciona para o nosso cenário

- `Inventory` sempre faz FK para `products.id` — independente do tipo. Nenhuma mudança na lógica de estoque ao adicionar novos tipos.
- Adicionar `SupplementDetails` no futuro = nova migration, zero impacto em `products` e em código existente.
- `GET /api/medications` filtra por `product_type = 'Medication'` e faz LEFT JOIN em `medication_details`. Query explícita, controlada, sem magia do EF.
- Schema do banco reflete a realidade: um produto *pode ter* detalhes de medicamento, não *é um* medicamento.

## Comparativo

| | TPH | TPT | Composição |
|--|-----|-----|-----------|
| Schema limpo | Não | Sim | Sim |
| Adicionar novo tipo | Alter `products` | Nova tabela + EF config | Só nova tabela de detalhe |
| Performance EF Core | Boa | Ruim | Boa |
| Impacto no Inventory | Nenhum | Nenhum | Nenhum |
| Escalabilidade | Baixa | Média | Alta |

## Conclusão

Herança de entidade faz sentido quando os subtipos compartilham comportamento de domínio diferente. Aqui, `Medication` não tem comportamento distinto de `Product` — só tem dados a mais. Composição é o modelo correto.
