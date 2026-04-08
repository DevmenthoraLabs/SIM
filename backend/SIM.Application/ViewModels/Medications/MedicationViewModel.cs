using System.Linq.Expressions;
using SIM.Domain.Entities;

namespace SIM.Application.ViewModels.Medications;

public record MedicationViewModel(
    Guid Id,
    string Name,
    string? Description,
    string? BarCode,
    Guid? CategoryId,
    string? CategoryName,
    DateTime CreatedAt,
    bool IsActive,
    MedicationDetailsViewModel? Details)
{
    /// <summary>
    /// EF Core projection expression. Use with .Select() in queries — translated to SQL.
    /// Resolves CategoryName and MedicationDetails via join (no .Include() needed).
    /// </summary>
    public static Expression<Func<Product, MedicationViewModel>> FromEntity =>
        p => new MedicationViewModel(
            p.Id,
            p.Name,
            p.Description,
            p.BarCode,
            p.CategoryId,
            p.Category != null ? p.Category.Name : null,
            p.CreatedAt,
            p.IsActive,
            p.MedicationDetails != null
                ? new MedicationDetailsViewModel(
                    p.MedicationDetails.GenericName,
                    p.MedicationDetails.ActiveIngredient,
                    p.MedicationDetails.Presentation,
                    p.MedicationDetails.Concentration,
                    p.MedicationDetails.IsControlled)
                : null);

    /// <summary>
    /// Maps from a materialized Product instance. Use after entity creation/update.
    /// MedicationDetails is populated only when the navigation is loaded.
    /// </summary>
    public static MedicationViewModel From(Product p) =>
        new(p.Id,
            p.Name,
            p.Description,
            p.BarCode,
            p.CategoryId,
            p.Category?.Name,
            p.CreatedAt,
            p.IsActive,
            p.MedicationDetails is not null
                ? MedicationDetailsViewModel.From(p.MedicationDetails)
                : null);
}
