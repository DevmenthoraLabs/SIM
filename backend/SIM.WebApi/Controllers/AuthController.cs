using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SIM.Application.Abstractions;
using SIM.Application.Abstractions.Services;
using SIM.Application.Exceptions;
using SIM.Application.ViewModels.Auth;
using SIM.Domain.Constants;

namespace SIM.WebApi.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(
    IAuthService authService,
    IIdentityAdminService identityAdminService,
    IValidator<SetPasswordViewModel> setPasswordValidator,
    ICurrentUserService currentUserService) : ControllerBase
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
        CancellationToken cancellationToken)
    {
        var validation = await setPasswordValidator.ValidateAsync(vm, cancellationToken);
        if (!validation.IsValid)
            throw new BusinessLogicException(string.Join(" ", validation.Errors.Select(e => e.ErrorMessage)));

        await identityAdminService.UpdatePasswordAsync(currentUserService.UserId, vm.Password, cancellationToken);
        return NoContent();
    }
}
