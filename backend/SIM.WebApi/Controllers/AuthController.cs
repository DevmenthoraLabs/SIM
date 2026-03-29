using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SIM.Application.Abstractions.Services;
using SIM.Application.ViewModels.Auth;

namespace SIM.WebApi.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(IAuthService authService) : ControllerBase
{
    /// <summary>
    /// Authenticates a user and returns an access token and refresh token.
    /// Use the returned accessToken in the Authorization header for all other endpoints.
    /// </summary>
    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<IActionResult> Login(
        [FromBody] LoginViewModel vm,
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
    public async Task<IActionResult> Refresh(
        [FromBody] RefreshViewModel vm,
        CancellationToken cancellationToken)
    {
        var result = await authService.RefreshAsync(vm, cancellationToken);
        return Ok(result);
    }
}
