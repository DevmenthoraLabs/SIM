using Microsoft.AspNetCore.Authentication;
using System.Security.Claims;

namespace SIM.WebApi.Auth;

/// <summary>
/// Maps custom claims injected by the Supabase Custom Access Token Hook
/// into the ASP.NET Core claims principal.
///
/// The hook adds 'sim_role' and 'sim_organization_id' as top-level JWT claims
/// at token generation time, so no database query is needed here.
/// </summary>
public class SupabaseClaimsTransformation : IClaimsTransformation
{
    public Task<ClaimsPrincipal> TransformAsync(ClaimsPrincipal principal)
    {
        // Already transformed — avoid adding duplicate claims on repeated calls.
        if (principal.HasClaim(c => c.Type == SimClaimTypes.OrganizationId))
            return Task.FromResult(principal);

        var simRole = principal.FindFirstValue("sim_role");
        var orgId   = principal.FindFirstValue("sim_organization_id");

        if (simRole is null || orgId is null)
            return Task.FromResult(principal);

        var identity = (ClaimsIdentity)principal.Identity!;
        identity.AddClaim(new Claim(ClaimTypes.Role,          simRole));
        identity.AddClaim(new Claim(SimClaimTypes.OrganizationId, orgId));

        return Task.FromResult(principal);
    }
}
