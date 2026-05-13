using System.Linq.Expressions;
using SIM.Domain.Entities;

namespace SIM.Application.ViewModels.Batches;

public record BatchViewModel(
    Guid Id,
    Guid ProductId,
    string ProductName,
    Guid SupplierId,
    string SupplierName,
    string LotNumber,
    DateOnly? ManufacturingDate,
    DateOnly ExpiryDate,
    decimal Quantity,
    decimal? UnitCost,
    DateTime CreatedAt,
    bool IsActive)
{
    /// <summary>
    /// EF Core projection expression. Use with .Select() in queries — translated to SQL.
    /// Resolves ProductName and SupplierName via join (no .Include() needed).
    /// </summary>
    public static Expression<Func<Batch, BatchViewModel>> FromEntity =>
        b => new BatchViewModel(
            b.Id,
            b.ProductId,
            b.Product != null ? b.Product.Name : string.Empty,
            b.SupplierId,
            b.Supplier != null ? b.Supplier.Name : string.Empty,
            b.LotNumber,
            b.ManufacturingDate,
            b.ExpiryDate,
            b.Quantity,
            b.UnitCost,
            b.CreatedAt,
            b.IsActive);

    /// <summary>
    /// Maps from a materialized Batch instance. Use after entity creation/update.
    /// </summary>
    public static BatchViewModel From(Batch b) =>
        new(b.Id,
            b.ProductId,
            b.Product?.Name ?? string.Empty,
            b.SupplierId,
            b.Supplier?.Name ?? string.Empty,
            b.LotNumber,
            b.ManufacturingDate,
            b.ExpiryDate,
            b.Quantity,
            b.UnitCost,
            b.CreatedAt,
            b.IsActive);
}
