using SIM.Application.ViewModels.Auth;

namespace SIM.Application.Abstractions.Services;

/// <summary>
/// Authenticates a user and manages token lifecycle.
/// The concrete implementation is provider-specific (Supabase, Auth0, etc.)
/// and lives in the Infrastructure layer.
/// </summary>
public interface IAuthService
{
    Task<LoginResponseViewModel> LoginAsync(LoginViewModel vm, CancellationToken cancellationToken = default);
    Task<LoginResponseViewModel> RefreshAsync(RefreshViewModel vm, CancellationToken cancellationToken = default);
}
