namespace SIM.Domain.Abstractions;

/// <summary>
/// Marks an entity as belonging to a specific organization.
/// ApplicationDbContext automatically applies a global query filter for all
/// implementing entities, scoping every read to the current user's organization.
/// SuperAdmin users bypass the filter and see data across all organizations.
/// </summary>
public interface IOrganizationScoped
{
    Guid OrganizationId { get; }
}
