using SIM.Domain.Entities;

namespace SIM.Application.ViewModels.Medications;

public record MedicationDetailsViewModel(
    string? GenericName,
    string? ActiveIngredient,
    string? Presentation,
    string? Concentration,
    bool IsControlled)
{
    public static MedicationDetailsViewModel From(MedicationDetails d) =>
        new(d.GenericName,
            d.ActiveIngredient,
            d.Presentation,
            d.Concentration,
            d.IsControlled);
}
