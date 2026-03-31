namespace SIM.Domain.Constants;

/// <summary>
/// Named authorization policy constants.
/// Policies are registered in the host's service configuration.
/// </summary>
public static class Policies
{
    /// <summary>
    /// Requires SuperAdmin role AND membership in the SimSuporte organization.
    /// </summary>
    public const string SimSuporte = "SimSuporte";
}
