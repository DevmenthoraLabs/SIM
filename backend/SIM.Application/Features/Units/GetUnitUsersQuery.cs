using Microsoft.EntityFrameworkCore;
using SIM.Application.ViewModels.Users;
using SIM.Domain.Abstractions;

namespace SIM.Application.Features.Units;

public class GetUnitUsersQuery(IUnitOfWork unitOfWork)
{
    public async Task<IReadOnlyList<UserViewModel>> HandleAsync(
        Guid unitId,
        CancellationToken cancellationToken = default)
    {
        // Step 1: collect user IDs active in this unit
        var userIds = await unitOfWork.UserUnits
            .Where(uu => uu.UnitId == unitId && uu.IsActive)
            .Select(uu => uu.UserId)
            .ToListAsync(cancellationToken);

        if (userIds.Count == 0) return [];

        // Step 2: load all active unit assignments for those users (avoids N+1)
        var allAssignments = await unitOfWork.UserUnits
            .Where(uu => userIds.Contains(uu.UserId) && uu.IsActive)
            .Select(uu => new { uu.UserId, uu.UnitId })
            .ToListAsync(cancellationToken);

        var unitIdsByUser = allAssignments
            .GroupBy(x => x.UserId)
            .ToDictionary(g => g.Key, g => (IReadOnlyList<Guid>)g.Select(x => x.UnitId).ToList());

        // Step 3: load user profiles
        var users = await unitOfWork.UserProfiles
            .Where(u => userIds.Contains(u.Id))
            .ToListAsync(cancellationToken);

        return users
            .Select(u => new UserViewModel(
                u.Id, u.FullName, u.Email, u.Role,
                u.OrganizationId,
                unitIdsByUser.GetValueOrDefault(u.Id, []),
                u.CreatedAt, u.IsActive))
            .ToList();
    }
}
