using System.Security.Claims;
using SIM.Application.Abstractions;
using SIM.Domain.Constants;

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

    /// <inheritdoc/>
    public bool IsAdmin =>
        httpContextAccessor.HttpContext?.User.IsInRole(Roles.Admin) ?? false;

    /// <inheritdoc/>
    public IReadOnlyList<Guid> UnitIds
    {
        get
        {
            var value = httpContextAccessor.HttpContext?.User
                .FindFirstValue(SimClaimTypes.UnitIds);

            if (string.IsNullOrEmpty(value)) return [];

            return value.Split(',')
                .Select(s => Guid.TryParse(s, out var id) ? id : (Guid?)null)
                .Where(id => id.HasValue)
                .Select(id => id!.Value)
                .ToList()
                .AsReadOnly();
        }
    }

    /// <inheritdoc/>
    public bool HasAccessToUnit(Guid unitId) =>
        IsSuperAdmin || IsAdmin || UnitIds.Contains(unitId);
}
