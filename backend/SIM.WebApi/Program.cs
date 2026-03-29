using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Scalar.AspNetCore;
using SIM.Application.Abstractions;
using SIM.Application.Configuration;
using SIM.Infrastructure.Configuration;
using SIM.WebApi.Auth;
using SIM.WebApi.Exceptions;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddAuthProvider(builder.Configuration);
builder.Services.AddSupabaseAuthentication(builder.Configuration);

builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
builder.Services.AddProblemDetails();

// Claims transformation: carrega o UserProfile do DB e injeta o Role como claim ASP.NET Core
builder.Services.AddScoped<IClaimsTransformation, SupabaseClaimsTransformation>();

// CurrentUserService: disponibiliza o UserId do JWT autenticado para os AppServices
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<ICurrentUserService, CurrentUserService>();

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });

builder.Services.AddOpenApi();

var app = builder.Build();

app.UseExceptionHandler();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}

app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
