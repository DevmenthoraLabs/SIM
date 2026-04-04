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
        return await unitOfWork.UserUnits
            .Where(uu => uu.UnitId == unitId && uu.IsActive)
            .Select(uu => new UserViewModel(
                uu.User!.Id,
                uu.User.FullName,
                uu.User.Email,
                uu.User.Role,
                uu.User.OrganizationId,
                new List<Guid>(),
                uu.User.CreatedAt,
                uu.User.IsActive))
            .ToListAsync(cancellationToken);
    }
}
