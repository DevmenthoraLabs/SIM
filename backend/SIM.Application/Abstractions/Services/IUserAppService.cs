using SIM.Application.ViewModels.Users;

namespace SIM.Application.Abstractions.Services;

public interface IUserAppService
{
    Task<UserViewModel> InviteAsync(InviteUserViewModel vm, CancellationToken cancellationToken = default);
    Task<UserViewModel?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task UpdateRoleAsync(Guid userId, UpdateUserRoleViewModel vm, CancellationToken cancellationToken = default);
}
