using System.Security.Claims;
using SIM.Application.Abstractions;

namespace SIM.WebApi.Auth;

public class CurrentUserService(IHttpContextAccessor httpContextAccessor) : ICurrentUserService
{
    public Guid UserId
    {
        get
        {
            var value = httpContextAccessor.HttpContext?.User
                .FindFirstValue(ClaimTypes.NameIdentifier);

            return Guid.TryParse(value, out var id) ? id : Guid.Empty;
        }
    }

    public bool IsAuthenticated =>
        httpContextAccessor.HttpContext?.User.Identity?.IsAuthenticated ?? false;

    /// <inheritdoc/>
    public Guid? OrganizationId
    {
        get
        {
            var value = httpContextAccessor.HttpContext?.User
                .FindFirstValue(SimClaimTypes.OrganizationId);

            return Guid.TryParse(value, out var id) ? id : null;
        }
    }

    /// <inheritdoc/>
    public bool IsSuperAdmin =>
        httpContextAccessor.HttpContext?.User.IsInRole(Roles.SuperAdmin) ?? false;
}
