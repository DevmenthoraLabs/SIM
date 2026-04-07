using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using FluentValidation;
using SIM.Application.Abstractions.Services;
using SIM.Application.Exceptions;
using SIM.Application.ViewModels.Auth;
using SIM.Domain.Abstractions;
using SIM.Domain.Constants;

namespace SIM.Infrastructure.Auth;

public class SupabaseAuthService(
    IHttpClientFactory httpClientFactory,
    IUnitOfWork unitOfWork,
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

        var (role, organizationId) = await FetchUserProfileAsync(token.AccessToken, cancellationToken);

        return new LoginResponseViewModel(token.AccessToken, token.RefreshToken, token.TokenType, token.ExpiresIn, role, organizationId);
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

        var (role, organizationId) = await FetchUserProfileAsync(token.AccessToken, cancellationToken);

        return new LoginResponseViewModel(token.AccessToken, token.RefreshToken, token.TokenType, token.ExpiresIn, role, organizationId);
    }

    private async Task<(string Role, string OrganizationId)> FetchUserProfileAsync(
        string accessToken,
        CancellationToken cancellationToken)
    {
        var sub = ExtractSub(accessToken)
            ?? throw new BusinessLogicException(ValidationMessages.InvalidCredentials);

        if (!Guid.TryParse(sub, out var userId))
            throw new BusinessLogicException(ValidationMessages.InvalidCredentials);

        const string sql = """
            SELECT "Role", "OrganizationId"
            FROM user_profiles
            WHERE "Id" = @UserId AND "IsActive" = true
            """;

        var profile = await unitOfWork.QueryFirstOrDefaultAsync<(string Role, Guid OrganizationId)>(
            sql, new { UserId = userId });

        if (profile == default)
            throw new BusinessLogicException(ValidationMessages.InvalidCredentials);

        return (profile.Role, profile.OrganizationId.ToString());
    }

    private static string? ExtractSub(string jwt)
    {
        var parts = jwt.Split('.');
        if (parts.Length < 2) return null;

        var payload = parts[1];
        payload = payload.PadRight(payload.Length + (4 - payload.Length % 4) % 4, '=')
                         .Replace('-', '+').Replace('_', '/');

        var json = Encoding.UTF8.GetString(Convert.FromBase64String(payload));
        using var doc = JsonDocument.Parse(json);
        return doc.RootElement.TryGetProperty("sub", out var sub) ? sub.GetString() : null;
    }

    private sealed record SupabaseTokenResponse(
        [property: JsonPropertyName("access_token")] string AccessToken,
        [property: JsonPropertyName("refresh_token")] string RefreshToken,
        [property: JsonPropertyName("token_type")] string TokenType,
        [property: JsonPropertyName("expires_in")] int ExpiresIn);
}
