using Microsoft.EntityFrameworkCore;
using SIM.Application.ViewModels.Users;
using SIM.Domain.Abstractions;

namespace SIM.Application.Features.Users;

public class GetAllUsersQuery(IUnitOfWork unitOfWork)
{
    public async Task<IReadOnlyList<UserViewModel>> HandleAsync(
        CancellationToken cancellationToken = default)
    {
        var profiles = await unitOfWork.UserProfiles
            .OrderBy(u => u.FullName)
            .ToListAsync(cancellationToken);

        if (profiles.Count == 0) return [];

        var userIds = profiles.Select(p => p.Id).ToList();

        var userUnits = await unitOfWork.UserUnits
            .Where(uu => userIds.Contains(uu.UserId) && uu.IsActive)
            .Select(uu => new { uu.UserId, uu.UnitId })
            .ToListAsync(cancellationToken);

        var unitIdsByUser = userUnits
            .GroupBy(uu => uu.UserId)
            .ToDictionary(
                g => g.Key,
                g => (IReadOnlyList<Guid>)g.Select(uu => uu.UnitId).ToList());

        return profiles
            .Select(p => new UserViewModel(
                p.Id, p.FullName, p.Email, p.Role,
                p.OrganizationId,
                unitIdsByUser.GetValueOrDefault(p.Id) ?? [],
                p.CreatedAt, p.IsActive))
            .ToList();
    }
}
