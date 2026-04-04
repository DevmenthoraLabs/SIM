namespace SIM.Application.Abstractions;

public interface ICurrentUserService
{
    Guid UserId { get; }
    bool IsAuthenticated { get; }

    /// <summary>
    /// The organization the authenticated user belongs to.
    /// SuperAdmin users belong to the SimSuporte org — this is never null for authenticated users.
    /// Returns null only for unauthenticated requests.
    /// </summary>
    Guid? OrganizationId { get; }

    /// <summary>
    /// True when the authenticated user has the SuperAdmin role.
    /// SuperAdmin users are internal (SIM support team) and have no organization scope.
    /// </summary>
    bool IsSuperAdmin { get; }

    /// <summary>
    /// True when the authenticated user has the Admin role (not SuperAdmin).
    /// Admin users have cross-unit access within their organization.
    /// </summary>
    bool IsAdmin { get; }

    /// <summary>
    /// Active unit assignments loaded from user_units via claims transformation.
    /// Empty for Admin and SuperAdmin (cross-unit access is implicit for those roles).
    /// </summary>
    IReadOnlyList<Guid> UnitIds { get; }

    /// <summary>
    /// Returns true if the user has access to the given unit.
    /// SuperAdmin and Admin always return true. Operational roles require an active UserUnit.
    /// </summary>
    bool HasAccessToUnit(Guid unitId);
}
