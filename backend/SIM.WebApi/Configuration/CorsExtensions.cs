using Microsoft.AspNetCore.Cors.Infrastructure;

namespace SIM.WebApi.Configuration;

public static class CorsExtensions
{
    private const string PolicyName = "SimCorsPolicy";

    public static IServiceCollection AddSimCors(this IServiceCollection services, IConfiguration configuration)
    {
        var allowedOrigins = configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [];

        services.AddCors(options =>
        {
            options.AddPolicy(PolicyName, policy =>
            {
                policy.WithOrigins(allowedOrigins)
                      .AllowAnyHeader()
                      .AllowAnyMethod();
            });
        });

        return services;
    }

    public static IApplicationBuilder UseSimCors(this IApplicationBuilder app) =>
        app.UseCors(PolicyName);
}
