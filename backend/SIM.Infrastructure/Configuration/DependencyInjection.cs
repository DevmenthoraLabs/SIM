using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using Npgsql;
using SIM.Application.Abstractions.Services;
using SIM.Domain.Abstractions;
using SIM.Infrastructure.Auth;
using SIM.Infrastructure.Data;

namespace SIM.Infrastructure.Configuration;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("ConnectionStrings:DefaultConnection is not configured.");

        // Explicitly register NpgsqlDataSource as singleton (recommended since Npgsql 7).
        // Without this, Npgsql creates an implicit internal data source whose lifecycle
        // is not properly managed — its connection pool can be disposed unexpectedly
        // during long-running requests (e.g. while awaiting an external HTTP call),
        // causing ObjectDisposedException on the pool semaphore.
        var dataSource = new NpgsqlDataSourceBuilder(connectionString).Build();
        services.AddSingleton(dataSource);

        services.AddDbContext<ApplicationDbContext>((sp, options) =>
            options.UseNpgsql(sp.GetRequiredService<NpgsqlDataSource>()));

        services.AddScoped<IUnitOfWork>(sp => sp.GetRequiredService<ApplicationDbContext>());

        return services;
    }

    /// <summary>
    /// Registers the auth provider implementation (currently Supabase).
    /// To swap providers: replace SupabaseAuthService with a new implementation
    /// and update the HttpClient configuration below — no other layer changes.
    /// </summary>
    public static IServiceCollection AddAuthProvider(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var supabaseUrl = configuration["Supabase:Url"]
            ?? throw new InvalidOperationException("Supabase:Url is not configured.");

        var anonKey = configuration["Supabase:AnonKey"]
            ?? throw new InvalidOperationException("Supabase:AnonKey is not configured.");

        services.AddHttpClient("SupabaseAuth", client =>
        {
            client.BaseAddress = new Uri($"{supabaseUrl}/auth/v1/");
            client.DefaultRequestHeaders.Add("apikey", anonKey);
        });

        var serviceRoleKey = configuration["Supabase:ServiceRoleKey"]
            ?? throw new InvalidOperationException("Supabase:ServiceRoleKey is not configured.");

        services.AddHttpClient("SupabaseAdmin", client =>
        {
            client.BaseAddress = new Uri($"{supabaseUrl}/auth/v1/");
        })
        .AddHttpMessageHandler(() => new SupabaseAdminAuthHandler(serviceRoleKey));

        services.AddScoped<IAuthService, SupabaseAuthService>();
        services.AddScoped<IIdentityAdminService, SupabaseAdminService>();

        return services;
    }

    /// <summary>
    /// Configures JWT Bearer authentication using Supabase's JWKS endpoint (RS256).
    /// Keys are fetched automatically via OIDC discovery — no secret required in config.
    /// </summary>
    public static IServiceCollection AddSupabaseAuthentication(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var supabaseUrl = configuration["Supabase:Url"]
            ?? throw new InvalidOperationException("Supabase:Url is not configured.");

        var authority = $"{supabaseUrl}/auth/v1";

        services
            .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                options.Authority = authority;
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidIssuer = authority,
                    ValidateAudience = true,
                    ValidAudience = "authenticated",
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.Zero
                };
            });

        return services;
    }
}
