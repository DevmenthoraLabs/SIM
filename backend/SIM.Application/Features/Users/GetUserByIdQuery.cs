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
        return await unitOfWork.UserProfiles
            .Where(u => u.Id == id)
            .Select(u => new UserViewModel(
                u.Id, u.FullName, u.Email, u.Role,
                u.OrganizationId, u.UnitId, u.CreatedAt, u.IsActive))
            .FirstOrDefaultAsync(cancellationToken);
    }
}
