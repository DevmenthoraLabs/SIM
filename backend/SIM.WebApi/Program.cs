using Microsoft.AspNetCore.Authentication;
using Scalar.AspNetCore;
using Serilog;
using Serilog.Formatting.Compact;
using SIM.Application.Abstractions;
using SIM.Application.Configuration;
using SIM.Domain.Constants;
using SIM.Infrastructure.Configuration;
using SIM.WebApi.Auth;
using SIM.WebApi.Configuration;
using SIM.WebApi.Exceptions;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

builder.Host.UseSerilog((context, config) =>
    config
        .ReadFrom.Configuration(context.Configuration)
        .Enrich.FromLogContext()
        .WriteTo.Console(new CompactJsonFormatter()));

builder.Services.AddSimCors(builder.Configuration);
builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddAuthProvider(builder.Configuration);
builder.Services.AddSupabaseAuthentication(builder.Configuration);
builder.Services.AddSimRateLimiting();

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy(Policies.SimSuporte, policy => policy
        .RequireRole(Roles.SuperAdmin)
        .RequireClaim(SimClaimTypes.OrganizationId, SystemOrganizations.SimSuporte.ToString()));
});

builder.Services.AddMemoryCache();
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
builder.Services.AddProblemDetails();

// Claims transformation: mapeia claims do JWT (provider-specific) para claims padrão da aplicação
builder.Services.AddScoped<IClaimsTransformation, SupabaseClaimsTransformation>();

// CurrentUserService: disponibiliza o UserId do JWT autenticado para os handlers
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<ICurrentUserService, CurrentUserService>();

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });

builder.Services.AddOpenApi();
builder.Services.AddHealthChecks();

var app = builder.Build();

app.UseExceptionHandler();
app.UseSerilogRequestLogging();
app.UseSimCors();
app.UseSimRateLimiting();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}

app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.MapHealthChecks("/health");

app.Run();
