namespace SIM.WebApi.Auth;

/// <summary>
/// Custom claim types added by SupabaseClaimsTransformation beyond the standard JWT claims.
/// These are injected after the UserProfile is loaded from the database on each request.
/// </summary>
public static class SimClaimTypes
{
    /// <summary>
    /// The organization the authenticated user belongs to (Guid string).
    /// Empty string for SuperAdmin users, who have no organization scope.
    /// </summary>
    public const string OrganizationId = "sim:organization_id";
}
