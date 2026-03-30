namespace SIM.Application.ViewModels.Auth;

public record SetPasswordViewModel(string TokenHash, string Type, string Password);
