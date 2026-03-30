using System.Net.Http.Headers;
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
    IValidator<RefreshViewModel> refreshValidator,
    IValidator<SetPasswordViewModel> setPasswordValidator) : IAuthService
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

    public async Task<LoginResponseViewModel> SetPasswordAsync(
        SetPasswordViewModel vm,
        CancellationToken cancellationToken = default)
    {
        var validation = await setPasswordValidator.ValidateAsync(vm, cancellationToken);
        if (!validation.IsValid)
            throw new BusinessLogicException(string.Join(" ", validation.Errors.Select(e => e.ErrorMessage)));

        var client = httpClientFactory.CreateClient("SupabaseAuth");

        // Step 1: Verify the one-time token and obtain a temporary session.
        var verifyResponse = await client.PostAsJsonAsync(
            "verify",
            new { token_hash = vm.TokenHash, type = vm.Type },
            cancellationToken);

        if (!verifyResponse.IsSuccessStatusCode)
            throw new BusinessLogicException(ValidationMessages.InvalidOrExpiredToken);

        var session = await verifyResponse.Content.ReadFromJsonAsync<SupabaseTokenResponse>(cancellationToken: cancellationToken)
            ?? throw new BusinessLogicException(ValidationMessages.InvalidOrExpiredToken);

        // Step 2: Use the session to set the user's password.
        // The Authorization header is set per-request since this uses the user's token, not the service key.
        var request = new HttpRequestMessage(HttpMethod.Put, "user");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", session.AccessToken);
        request.Content = JsonContent.Create(new { password = vm.Password });

        var updateResponse = await client.SendAsync(request, cancellationToken);

        if (!updateResponse.IsSuccessStatusCode)
            throw new BusinessLogicException(ValidationMessages.SetPasswordFailed);

        return new LoginResponseViewModel(session.AccessToken, session.RefreshToken, session.TokenType, session.ExpiresIn);
    }

    // Private record — Supabase response shape, scoped to this implementation.
    // If the auth provider changes, only this file changes.
    private sealed record SupabaseTokenResponse(
        [property: JsonPropertyName("access_token")] string AccessToken,
        [property: JsonPropertyName("refresh_token")] string RefreshToken,
        [property: JsonPropertyName("token_type")] string TokenType,
        [property: JsonPropertyName("expires_in")] int ExpiresIn);
}
