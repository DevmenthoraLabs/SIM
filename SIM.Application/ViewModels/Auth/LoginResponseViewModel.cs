namespace SIM.Application.ViewModels.Auth;

public record LoginResponseViewModel(string AccessToken, string TokenType, int ExpiresIn);
