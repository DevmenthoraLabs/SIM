using Microsoft.AspNetCore.Authentication;
using System.Security.Claims;
using SIM.Domain.Abstractions;
using SIM.Domain.Entities;

namespace SIM.WebApi.Auth;

/// <summary>
/// Loads the UserProfile from the database after Supabase JWT validation
/// and injects the application Role as an ASP.NET Core claim.
/// This enables [Authorize(Roles = "...")] to work with our domain roles.
/// </summary>
public class SupabaseClaimsTransformation(IRepository<UserProfile> userProfileRepository) : IClaimsTransformation
{
    public async Task<ClaimsPrincipal> TransformAsync(ClaimsPrincipal principal)
    {
        var sub = principal.FindFirstValue(ClaimTypes.NameIdentifier);

        if (!Guid.TryParse(sub, out var userId))
            return principal;

        // If transformation already ran, skip.
        // We check SimClaimTypes.OrganizationId (not ClaimTypes.Role) because
        // Supabase JWTs already contain role="authenticated" which maps to ClaimTypes.Role,
        // causing the role check to return true before we inject our application role.
        if (principal.HasClaim(c => c.Type == SimClaimTypes.OrganizationId))
            return principal;

        var profile = await userProfileRepository.GetByIdAsync(userId);
        if (profile is null)
            return principal;

        var identity = (ClaimsIdentity)principal.Identity!;
        identity.AddClaim(new Claim(ClaimTypes.Role, profile.Role.ToString()));
        identity.AddClaim(new Claim(SimClaimTypes.OrganizationId, profile.OrganizationId.ToString()));

        return principal;
    }
}
