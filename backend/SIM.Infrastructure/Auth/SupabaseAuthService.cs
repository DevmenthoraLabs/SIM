using System.Net.Http.Json;
using System.Text.Json.Serialization;
using FluentValidation;
using SIM.Application.Abstractions.Services;
using SIM.Application.Exceptions;
using SIM.Application.ViewModels.Auth;
using SIM.Domain.Constants;

namespace SIM.Infrastructure.Auth;

public class SupabaseAuthService(
    IHttpClientFactory httpClientFactory,
    IValidator<LoginViewModel> loginValidator,
    IValidator<RefreshViewModel> refreshValidator) : IAuthService
{
    public async Task<LoginResponseViewModel> LoginAsync(
        LoginViewModel vm,
        CancellationToken cancellationToken = default)
    {
        var validation = await loginValidator.ValidateAsync(vm, cancellationToken);
        if (!validation.IsValid)
            throw new BusinessLogicException(string.Join(" ", validation.Errors.Select(e => e.ErrorMessage)));

        var client = httpClientFactory.CreateClient("SupabaseAuth");

        var response = await client.PostAsJsonAsync(
            "token?grant_type=password",
            new { email = vm.Email, password = vm.Password },
            cancellationToken);

        if (!response.IsSuccessStatusCode)
            throw new BusinessLogicException(ValidationMessages.InvalidCredentials);

        var token = await response.Content.ReadFromJsonAsync<SupabaseTokenResponse>(cancellationToken: cancellationToken)
            ?? throw new BusinessLogicException(ValidationMessages.InvalidCredentials);

        return new LoginResponseViewModel(token.AccessToken, token.RefreshToken, token.TokenType, token.ExpiresIn);
    }

    public async Task<LoginResponseViewModel> RefreshAsync(
        RefreshViewModel vm,
        CancellationToken cancellationToken = default)
    {
        var validation = await refreshValidator.ValidateAsync(vm, cancellationToken);
        if (!validation.IsValid)
            throw new BusinessLogicException(string.Join(" ", validation.Errors.Select(e => e.ErrorMessage)));

        var client = httpClientFactory.CreateClient("SupabaseAuth");

        var response = await client.PostAsJsonAsync(
            "token?grant_type=refresh_token",
            new { refresh_token = vm.RefreshToken },
            cancellationToken);

        if (!response.IsSuccessStatusCode)
            throw new BusinessLogicException(ValidationMessages.InvalidRefreshToken);

        var token = await response.Content.ReadFromJsonAsync<SupabaseTokenResponse>(cancellationToken: cancellationToken)
            ?? throw new BusinessLogicException(ValidationMessages.InvalidRefreshToken);

        return new LoginResponseViewModel(token.AccessToken, token.RefreshToken, token.TokenType, token.ExpiresIn);
    }

    private sealed record SupabaseTokenResponse(
        [property: JsonPropertyName("access_token")] string AccessToken,
        [property: JsonPropertyName("refresh_token")] string RefreshToken,
        [property: JsonPropertyName("token_type")] string TokenType,
        [property: JsonPropertyName("expires_in")] int ExpiresIn);
}
