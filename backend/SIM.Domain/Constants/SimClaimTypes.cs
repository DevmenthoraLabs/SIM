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

    /// <summary>
    /// Comma-separated list of UnitIds the user has active access to.
    /// Empty for Admin and SuperAdmin (cross-unit access is implicit for those roles).
    /// </summary>
    public const string UnitIds = "sim:unit_ids";
}
