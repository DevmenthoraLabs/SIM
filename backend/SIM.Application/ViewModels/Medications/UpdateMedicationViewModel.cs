namespace SIM.Application.ViewModels.Medications;

public record UpdateMedicationViewModel(
    string Name,
    string? Description,
    string? BarCode,
    Guid? CategoryId,
    string? GenericName,
    string? ActiveIngredient,
    string? Presentation,
    string? Concentration,
    bool IsControlled);
