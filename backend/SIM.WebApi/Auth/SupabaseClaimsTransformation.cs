using Microsoft.AspNetCore.Authentication;
using SIM.Domain.Constants;
using System.Security.Claims;

namespace SIM.WebApi.Auth;

/// <summary>
/// Maps provider-specific JWT claims into the application's standard claim types.
///
/// Currently reads 'sim_role' and 'sim_organization_id' from Supabase's
/// Custom Access Token Hook. To switch providers (e.g. Keycloak), replace
/// this class with one that reads the new provider's claim names and maps
/// them to the same SimClaimTypes / ClaimTypes.Role targets.
/// </summary>
public class SupabaseClaimsTransformation : IClaimsTransformation
{
    // Source claim names as defined in the Supabase Custom Access Token Hook.
    // These are the only Supabase-specific values in the application.
    private const string SourceRoleClaim = "sim_role";
    private const string SourceOrgClaim  = "sim_organization_id";

    public Task<ClaimsPrincipal> TransformAsync(ClaimsPrincipal principal)
    {
        if (principal.HasClaim(c => c.Type == SimClaimTypes.OrganizationId))
            return Task.FromResult(principal);

        var simRole = principal.FindFirstValue(SourceRoleClaim);
        var orgId   = principal.FindFirstValue(SourceOrgClaim);

        if (simRole is null || orgId is null)
            return Task.FromResult(principal);

        var identity = (ClaimsIdentity)principal.Identity!;
        identity.AddClaim(new Claim(ClaimTypes.Role, simRole));
        identity.AddClaim(new Claim(SimClaimTypes.OrganizationId, orgId));

        return Task.FromResult(principal);
    }
}
