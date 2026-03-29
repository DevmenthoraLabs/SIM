using SIM.Application.ViewModels.Users;

namespace SIM.Application.Abstractions.Services;

public interface IUserAppService
{
    Task<UserViewModel> CreateAsync(CreateUserViewModel vm, CancellationToken cancellationToken = default);
    Task<UserViewModel?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
}
