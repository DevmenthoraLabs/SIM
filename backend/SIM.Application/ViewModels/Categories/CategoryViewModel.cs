using System.Linq.Expressions;
using SIM.Domain.Entities;

namespace SIM.Application.ViewModels.Categories;

public record CategoryViewModel(
    Guid Id,
    string Name,
    Guid? ParentId,
    Guid OrganizationId,
    DateTime CreatedAt,
    bool IsActive)
{
    /// <summary>
    /// EF Core projection expression. Use with .Select() in queries — translated to SQL.
    /// </summary>
    public static Expression<Func<Category, CategoryViewModel>> FromEntity =>
        c => new CategoryViewModel(
            c.Id,
            c.Name,
            c.ParentId,
            c.OrganizationId,
            c.CreatedAt,
            c.IsActive);

    /// <summary>
    /// Maps from a materialized Category instance. Use after entity creation/update.
    /// </summary>
    public static CategoryViewModel From(Category c) =>
        new(c.Id,
            c.Name,
            c.ParentId,
            c.OrganizationId,
            c.CreatedAt,
            c.IsActive);
}
