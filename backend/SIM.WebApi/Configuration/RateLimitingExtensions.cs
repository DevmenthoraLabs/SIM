using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using System.Threading.RateLimiting;

namespace SIM.WebApi.Configuration;

public static class RateLimitingExtensions
{
    // Applied to login and refresh endpoints — keeps the name internal
    public const string AuthPolicy = "auth";

    public static IServiceCollection AddSimRateLimiting(this IServiceCollection services)
    {
        services.AddRateLimiter(options =>
        {
            // 10 requests per minute per IP — protects against brute-force and credential stuffing
            options.AddPolicy(AuthPolicy, httpContext =>
                RateLimitPartition.GetFixedWindowLimiter(
                    partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
                    factory: _ => new FixedWindowRateLimiterOptions
                    {
                        PermitLimit = 10,
                        Window = TimeSpan.FromMinutes(1),
                        QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                        QueueLimit = 0
                    }));

            options.OnRejected = async (context, token) =>
            {
                context.HttpContext.Response.StatusCode = StatusCodes.Status429TooManyRequests;
                await context.HttpContext.Response.WriteAsJsonAsync(new ProblemDetails
                {
                    Status = StatusCodes.Status429TooManyRequests,
                    Title = "Too Many Requests",
                    Detail = "Muitas tentativas. Aguarde um momento e tente novamente."
                }, token);
            };
        });

        return services;
    }

    public static IApplicationBuilder UseSimRateLimiting(this IApplicationBuilder app) =>
        app.UseRateLimiter();
}
