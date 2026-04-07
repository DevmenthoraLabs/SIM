namespace SIM.Domain.Entities;

public class MedicationDetails
{
    public Guid ProductId { get; private set; }
    public string? GenericName { get; private set; }
    public string? ActiveIngredient { get; private set; }
    public string? Presentation { get; private set; }
    public string? Concentration { get; private set; }
    public bool IsControlled { get; private set; }

    // Navigation
    public Product? Product { get; private set; }

    private MedicationDetails() { }

    internal static MedicationDetails Create(
        Guid productId,
        string? genericName,
        string? activeIngredient,
        string? presentation,
        string? concentration,
        bool isControlled)
    {
        return new MedicationDetails
        {
            ProductId = productId,
            GenericName = genericName?.Trim(),
            ActiveIngredient = activeIngredient?.Trim(),
            Presentation = presentation?.Trim(),
            Concentration = concentration?.Trim(),
            IsControlled = isControlled
        };
    }

    internal void Update(
        string? genericName,
        string? activeIngredient,
        string? presentation,
        string? concentration,
        bool isControlled)
    {
        GenericName = genericName?.Trim();
        ActiveIngredient = activeIngredient?.Trim();
        Presentation = presentation?.Trim();
        Concentration = concentration?.Trim();
        IsControlled = isControlled;
    }
}
