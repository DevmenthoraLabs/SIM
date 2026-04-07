using System.Linq.Expressions;
using SIM.Domain.Entities;

namespace SIM.Application.ViewModels.Products;

public record ProductViewModel(
    Guid Id,
    string Name,
    string? Description,
    string Type,
    string? BarCode,
    bool RequiresBatchTracking,
    Guid? CategoryId,
    DateTime CreatedAt,
    bool IsActive)
{
    /// <summary>
    /// EF Core projection expression. Use with .Select() in queries — translated to SQL.
    /// </summary>
    public static Expression<Func<Product, ProductViewModel>> FromEntity =>
        p => new ProductViewModel(
            p.Id,
            p.Name,
            p.Description,
            p.Type.ToString(),
            p.BarCode,
            p.RequiresBatchTracking,
            p.CategoryId,
            p.CreatedAt,
            p.IsActive);

    /// <summary>
    /// Maps from a materialized Product instance. Use after entity creation/update.
    /// </summary>
    public static ProductViewModel From(Product p) =>
        new(p.Id,
            p.Name,
            p.Description,
            p.Type.ToString(),
            p.BarCode,
            p.RequiresBatchTracking,
            p.CategoryId,
            p.CreatedAt,
            p.IsActive);
}
