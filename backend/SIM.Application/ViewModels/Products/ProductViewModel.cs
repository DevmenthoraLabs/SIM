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
    string? CategoryName,
    DateTime CreatedAt,
    bool IsActive)
{
    /// <summary>
    /// EF Core projection expression. Use with .Select() in queries — translated to SQL.
    /// Resolves CategoryName via join.
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
            p.Category != null ? p.Category.Name : null,
            p.CreatedAt,
            p.IsActive);

    /// <summary>
    /// Maps from a materialized Product instance. Use after entity creation/update.
    /// CategoryName is populated only when the Category navigation is loaded.
    /// </summary>
    public static ProductViewModel From(Product p) =>
        new(p.Id,
            p.Name,
            p.Description,
            p.Type.ToString(),
            p.BarCode,
            p.RequiresBatchTracking,
            p.CategoryId,
            p.Category?.Name,
            p.CreatedAt,
            p.IsActive);
}
