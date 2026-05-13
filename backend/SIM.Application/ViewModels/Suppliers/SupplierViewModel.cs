using System.Linq.Expressions;
using SIM.Domain.Entities;

namespace SIM.Application.ViewModels.Suppliers;

public record SupplierViewModel(
    Guid Id,
    string Name,
    string Cnpj,
    string? Phone,
    string? Email,
    string? ContactName,
    string? Street,
    string? City,
    string? State,
    string? ZipCode,
    DateTime CreatedAt,
    bool IsActive)
{
    /// <summary>
    /// EF Core projection expression. Use with .Select() in queries — translated to SQL.
    /// </summary>
    public static Expression<Func<Supplier, SupplierViewModel>> FromEntity =>
        s => new SupplierViewModel(
            s.Id,
            s.Name,
            s.Cnpj,
            s.Phone,
            s.Email,
            s.ContactName,
            s.Street,
            s.City,
            s.State,
            s.ZipCode,
            s.CreatedAt,
            s.IsActive);

    /// <summary>
    /// Maps from a materialized Supplier instance. Use after entity creation/update.
    /// </summary>
    public static SupplierViewModel From(Supplier s) =>
        new(s.Id,
            s.Name,
            s.Cnpj,
            s.Phone,
            s.Email,
            s.ContactName,
            s.Street,
            s.City,
            s.State,
            s.ZipCode,
            s.CreatedAt,
            s.IsActive);
}
