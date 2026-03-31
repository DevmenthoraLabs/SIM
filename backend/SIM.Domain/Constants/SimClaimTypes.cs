namespace SIM.Domain.Constants;

/// <summary>
/// Application-specific claim types used across the SIM platform.
/// These are provider-agnostic — the ClaimsTransformation in the host layer
/// maps provider-specific JWT claims to these standard types.
/// </summary>
public static class SimClaimTypes
{
    /// <summary>
    /// The organization the authenticated user belongs to (Guid string).
    /// </summary>
    public const string OrganizationId = "sim:organization_id";
}
