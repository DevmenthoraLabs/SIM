namespace SIM.WebApi.Auth;

/// <summary>
/// Named authorization policy constants for use in [Authorize(Policy = ...)] attributes.
/// Policies are registered in Program.cs via AddAuthorization.
/// </summary>
public static class Policies
{
    /// <summary>
    /// Requires SuperAdmin role AND membership in the SimSuporte organization.
    /// Used on all /api/suporte/* endpoints to ensure only internal SIM support
    /// staff can access backoffice operations.
    /// </summary>
    public const string SimSuporte = "SimSuporte";
}
