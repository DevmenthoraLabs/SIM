using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Caching.Memory;
using SIM.Domain.Abstractions;
using SIM.Domain.Constants;
using System.Security.Claims;

namespace SIM.WebApi.Auth;

/// <summary>
/// Maps the Supabase JWT's 'sub' claim into the application's standard claim types
/// by loading the user's profile (role, organizationId) and active UnitIds from the database.
/// Results are cached per user for 60 seconds to avoid a DB hit on every request.
///
/// Supabase is used only as an identity provider — the JWT only needs to carry 'sub'.
/// No Custom Access Token Hook is required. To switch providers (e.g. Keycloak), replace
/// this class with one that reads the new provider's subject claim and maps it to the
/// same SimClaimTypes / ClaimTypes.Role targets.
/// </summary>
public class SupabaseClaimsTransformation(
    IUnitOfWork unitOfWork,
    IMemoryCache cache) : IClaimsTransformation
{
    private static readonly TimeSpan CacheDuration = TimeSpan.FromSeconds(60);

    private record UserAuthCache(string Role, Guid OrganizationId, string UnitIdsCsv);

    public async Task<ClaimsPrincipal> TransformAsync(ClaimsPrincipal principal)
    {
        // Guard: already transformed this request — skip DB query
        if (principal.HasClaim(c => c.Type == SimClaimTypes.OrganizationId))
            return principal;

        var userId = principal.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userId, out var userGuid))
            return principal;

        var cacheKey = $"user_auth:{userGuid}";

        var cached = await cache.GetOrCreateAsync(cacheKey, async entry =>
        {
            entry.AbsoluteExpirationRelativeToNow = CacheDuration;

            const string sql = """
                SELECT up."Role", up."OrganizationId",
                       COALESCE(STRING_AGG(uu."UnitId"::text, ','), '') AS "UnitIdsCsv"
                FROM user_profiles up
                LEFT JOIN user_units uu ON uu."UserId" = up."Id"
                    AND uu."IsActive" = true
                    AND uu."OrganizationId" = up."OrganizationId"
                WHERE up."Id" = @UserId AND up."IsActive" = true
                GROUP BY up."Role", up."OrganizationId"
                """;

            var row = await unitOfWork.QueryFirstOrDefaultAsync<(string Role, Guid OrganizationId, string UnitIdsCsv)>(
                sql, new { UserId = userGuid });

            if (row == default)
                return null;

            return new UserAuthCache(row.Role, row.OrganizationId, row.UnitIdsCsv);
        });

        if (cached is null)
            return principal;

        var identity = (ClaimsIdentity)principal.Identity!;
        identity.AddClaim(new Claim(ClaimTypes.Role, cached.Role));
        identity.AddClaim(new Claim(SimClaimTypes.OrganizationId, cached.OrganizationId.ToString()));

        if (!string.IsNullOrEmpty(cached.UnitIdsCsv))
            identity.AddClaim(new Claim(SimClaimTypes.UnitIds, cached.UnitIdsCsv));

        return principal;
    }
}
