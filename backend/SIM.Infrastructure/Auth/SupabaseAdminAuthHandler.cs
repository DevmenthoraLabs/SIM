using System.Net.Http.Headers;

namespace SIM.Infrastructure.Auth;

/// <summary>
/// Adds the Supabase service_role API key to every request made by the SupabaseAdmin HttpClient.
/// Using a DelegatingHandler ensures the headers are set per-request, which is more reliable
/// than DefaultRequestHeaders when using IHttpClientFactory.
/// </summary>
public class SupabaseAdminAuthHandler(string apiKey) : DelegatingHandler
{
    protected override Task<HttpResponseMessage> SendAsync(
        HttpRequestMessage request,
        CancellationToken cancellationToken)
    {
        request.Headers.Add("apikey", apiKey);
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);
        return base.SendAsync(request, cancellationToken);
    }
}
