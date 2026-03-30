using System.Net.Http.Json;
using System.Text.Json.Serialization;
using Microsoft.Extensions.Logging;
using SIM.Application.Abstractions.Services;
using SIM.Application.Exceptions;
using SIM.Domain.Constants;

namespace SIM.Infrastructure.Auth;

public class SupabaseAdminService(
    IHttpClientFactory httpClientFactory,
    ILogger<SupabaseAdminService> logger) : IIdentityAdminService
{
    public async Task<Guid> InviteUserAsync(string email, CancellationToken cancellationToken = default)
    {
        var client = httpClientFactory.CreateClient("SupabaseAdmin");

        var response = await client.PostAsJsonAsync(
            "invite",
            new { email },
            cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            var body = await response.Content.ReadAsStringAsync(cancellationToken);
            logger.LogError(
                "Supabase invite failed. Status: {Status}, Body: {Body}",
                (int)response.StatusCode, body);

            throw new BusinessLogicException(ValidationMessages.InviteUserFailed);
        }

        var result = await response.Content.ReadFromJsonAsync<SupabaseAdminUserResponse>(cancellationToken: cancellationToken)
            ?? throw new BusinessLogicException(ValidationMessages.InviteUserFailed);

        return result.Id;
    }

    private sealed record SupabaseAdminUserResponse(
        [property: JsonPropertyName("id")] Guid Id);
}
