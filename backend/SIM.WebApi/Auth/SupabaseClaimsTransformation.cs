using Microsoft.AspNetCore.Authentication;
using SIM.Domain.Abstractions;
using SIM.Domain.Constants;
using System.Security.Claims;

namespace SIM.WebApi.Auth;

/// <summary>
/// Maps provider-specific JWT claims into the application's standard claim types.
/// Also loads the user's active UnitIds from the database (once per request via early-return guard).
///
/// Currently reads 'sim_role' and 'sim_organization_id' from Supabase's
/// Custom Access Token Hook. To switch providers (e.g. Keycloak), replace
/// this class with one that reads the new provider's claim names and maps
/// them to the same SimClaimTypes / ClaimTypes.Role targets.
/// </summary>
public class SupabaseClaimsTransformation(IUnitOfWork unitOfWork) : IClaimsTransformation
{
    // Source claim names as defined in the Supabase Custom Access Token Hook.
    // These are the only Supabase-specific values in the application.
    private const string SourceRoleClaim = "sim_role";
    private const string SourceOrgClaim  = "sim_organization_id";

    public async Task<ClaimsPrincipal> TransformAsync(ClaimsPrincipal principal)
    {
        // Guard: already transformed this request — skip DB query
        if (principal.HasClaim(c => c.Type == SimClaimTypes.OrganizationId))
            return principal;

        var simRole = principal.FindFirstValue(SourceRoleClaim);
        var orgId   = principal.FindFirstValue(SourceOrgClaim);

        if (simRole is null || orgId is null)
            return principal;

        var identity = (ClaimsIdentity)principal.Identity!;
        identity.AddClaim(new Claim(ClaimTypes.Role, simRole));
        identity.AddClaim(new Claim(SimClaimTypes.OrganizationId, orgId));

        // Load active UnitIds for operational roles (Admin and SuperAdmin skip — they have cross-unit access)
        if (simRole is not (Roles.Admin or Roles.SuperAdmin))
        {
            var userId = principal.FindFirstValue(ClaimTypes.NameIdentifier);

            if (Guid.TryParse(userId, out var userGuid) && Guid.TryParse(orgId, out var orgGuid))
            {
                const string sql = """
                    SELECT UnitId
                    FROM user_units
                    WHERE UserId = @UserId
                      AND IsActive = true
                      AND OrganizationId = @OrganizationId
                    """;

                var unitIds = await unitOfWork.QueryAsync<Guid>(sql, new { UserId = userGuid, OrganizationId = orgGuid });

                var csv = string.Join(',', unitIds);
                if (!string.IsNullOrEmpty(csv))
                    identity.AddClaim(new Claim(SimClaimTypes.UnitIds, csv));
            }
        }

        return principal;
    }
}
