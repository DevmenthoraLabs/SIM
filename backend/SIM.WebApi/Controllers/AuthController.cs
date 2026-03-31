using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using SIM.Application.Abstractions.Services;
using SIM.Application.Features.Auth;
using SIM.Application.ViewModels.Auth;
using SIM.WebApi.Configuration;

namespace SIM.WebApi.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    /// <summary>
    /// Authenticates a user and returns an access token and refresh token.
    /// Use the returned accessToken in the Authorization header for all other endpoints.
    /// </summary>
    [HttpPost("login")]
    [AllowAnonymous]
    [EnableRateLimiting(RateLimitingExtensions.AuthPolicy)]
    public async Task<IActionResult> Login(
        [FromBody] LoginViewModel vm,
        [FromServices] IAuthService authService,
        CancellationToken cancellationToken)
    {
        var result = await authService.LoginAsync(vm, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Issues a new access token using a valid refresh token.
    /// Call this when the access token has expired.
    /// </summary>
    [HttpPost("refresh")]
    [AllowAnonymous]
    [EnableRateLimiting(RateLimitingExtensions.AuthPolicy)]
    public async Task<IActionResult> Refresh(
        [FromBody] RefreshViewModel vm,
        [FromServices] IAuthService authService,
        CancellationToken cancellationToken)
    {
        var result = await authService.RefreshAsync(vm, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Sets the password for the currently authenticated user.
    /// Called after accepting an invite or password recovery email —
    /// the frontend receives a session via the URL fragment and uses it
    /// to authenticate this request before setting the password.
    /// </summary>
    [HttpPost("set-password")]
    [Authorize]
    public async Task<IActionResult> SetPassword(
        [FromBody] SetPasswordViewModel vm,
        [FromServices] SetPasswordCommandHandler handler,
        CancellationToken cancellationToken)
    {
        await handler.HandleAsync(vm, cancellationToken);
        return NoContent();
    }
}
