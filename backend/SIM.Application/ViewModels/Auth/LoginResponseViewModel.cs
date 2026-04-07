namespace SIM.Application.ViewModels.Auth;

public record LoginResponseViewModel(
    string AccessToken,
    string RefreshToken,
    string TokenType,
    int ExpiresIn,
    string Role,
    string OrganizationId);
