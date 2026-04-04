using System.Linq.Expressions;
using SIM.Domain.Entities;

namespace SIM.Application.ViewModels.Units;

public record UnitViewModel(
    Guid Id,
    string Name,
    string Code,
    string? Address,
    string? Phone,
    Guid OrganizationId,
    DateTime CreatedAt,
    bool IsActive)
{
    /// <summary>
    /// EF Core projection expression. Use with .Select() in queries — translated to SQL.
    /// </summary>
    public static Expression<Func<Unit, UnitViewModel>> FromEntity =>
        u => new UnitViewModel(
            u.Id,
            u.Name,
            u.Code,
            u.Address,
            u.Phone,
            u.OrganizationId,
            u.CreatedAt,
            u.IsActive);

    /// <summary>
    /// Maps from a materialized Unit instance. Use after entity creation/update.
    /// </summary>
    public static UnitViewModel From(Unit u) =>
        new(u.Id,
            u.Name,
            u.Code,
            u.Address,
            u.Phone,
            u.OrganizationId,
            u.CreatedAt,
            u.IsActive);
}
