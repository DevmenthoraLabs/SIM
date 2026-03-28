namespace SIM.Application.Abstractions;

public interface ICurrentUserService
{
    Guid UserId { get; }
    bool IsAuthenticated { get; }

    /// <summary>
    /// The organization the authenticated user belongs to.
    /// Null for SuperAdmin users, who operate across all organizations.
    /// </summary>
    Guid? OrganizationId { get; }

    /// <summary>
    /// True when the authenticated user has the SuperAdmin role.
    /// SuperAdmin users are internal (SIM support team) and have no organization scope.
    /// </summary>
    bool IsSuperAdmin { get; }
}
