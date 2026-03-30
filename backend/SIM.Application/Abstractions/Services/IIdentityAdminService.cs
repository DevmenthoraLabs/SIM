namespace SIM.Application.Abstractions.Services;

/// <summary>
/// Provider-agnostic contract for identity management operations
/// that require administrative access to the external auth provider.
/// Implementations are provider-specific (Supabase, Keycloak, etc.)
/// and live in the Infrastructure layer.
/// </summary>
public interface IIdentityAdminService
{
    /// <summary>
    /// Creates a new user in the external auth provider and sends an invitation email.
    /// Returns the new user's UUID for immediate UserProfile creation.
    /// </summary>
    Task<Guid> InviteUserAsync(string email, CancellationToken cancellationToken = default);

    /// <summary>
    /// Updates the password of an existing user via the admin API.
    /// Called after the user has authenticated via an invite or recovery email.
    /// </summary>
    Task UpdatePasswordAsync(Guid userId, string password, CancellationToken cancellationToken = default);
}
