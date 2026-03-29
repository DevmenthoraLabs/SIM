using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SIM.Application.Abstractions.Services;
using SIM.Application.ViewModels.Users;
using SIM.WebApi.Auth;

namespace SIM.WebApi.Controllers;

/// <summary>
/// User management endpoints for organization-level Admins.
/// Admins can only create and view users within their own organization.
/// Org isolation and role restrictions are enforced in UserAppService.
/// For cross-org operations, see the SIM Suporte area (api/suporte/users).
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = Roles.Admin)]
public class UsersController(IUserAppService userAppService) : ControllerBase
{
    /// <summary>
    /// Provisions an application profile for an existing Supabase Auth user.
    /// The OrganizationId must match the Admin's own organization.
    /// The role cannot be SuperAdmin — use api/suporte/users for that.
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> Create(
        [FromBody] CreateUserViewModel vm,
        CancellationToken cancellationToken)
    {
        var result = await userAppService.CreateAsync(vm, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
    {
        var result = await userAppService.GetByIdAsync(id, cancellationToken);
        return result is null ? NotFound() : Ok(result);
    }
}
