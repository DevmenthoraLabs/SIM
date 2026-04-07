using Microsoft.EntityFrameworkCore;
using SIM.Application.ViewModels.Users;
using SIM.Domain.Abstractions;

namespace SIM.Application.Features.Users;

public class GetUserByIdQuery(IUnitOfWork unitOfWork)
{
    public async Task<UserViewModel?> HandleAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var user = await unitOfWork.UserProfiles
            .Where(u => u.Id == id)
            .FirstOrDefaultAsync(cancellationToken);

        if (user is null) return null;

        var unitIds = await unitOfWork.UserUnits
            .Where(uu => uu.UserId == id && uu.IsActive)
            .Select(uu => uu.UnitId)
            .ToListAsync(cancellationToken);

        return new UserViewModel(
            user.Id, user.FullName, user.Email, user.Role,
            user.OrganizationId, unitIds.AsReadOnly(), user.CreatedAt, user.IsActive);
    }
}
