using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SIM.Application.Features.Users;
using SIM.Application.ViewModels.Users;
using SIM.Domain.Constants;

namespace SIM.WebApi.Controllers;

/// <summary>
/// User management endpoints for organization-level Admins.
/// Admins can only invite and view users within their own organization.
/// Org isolation and role restrictions are enforced in the handlers.
/// For cross-org operations, see the SIM Suporte area (api/suporte/users).
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = Roles.Admin)]
public class UsersController : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromServices] GetAllUsersQuery query,
        CancellationToken cancellationToken)
    {
        var result = await query.HandleAsync(cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Invites a new user via email. Supabase sends the invitation automatically.
    /// The OrganizationId must match the Admin's own organization.
    /// The role cannot be SuperAdmin — use api/suporte/users for that.
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> Invite(
        [FromBody] InviteUserViewModel vm,
        [FromServices] InviteUserCommandHandler handler,
        CancellationToken cancellationToken)
    {
        var result = await handler.HandleAsync(vm, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(
        Guid id,
        [FromServices] GetUserByIdQuery query,
        CancellationToken cancellationToken)
    {
        var result = await query.HandleAsync(id, cancellationToken);
        return result is null ? NotFound() : Ok(result);
    }

    /// <summary>
    /// Updates the role of a user within the Admin's organization.
    /// The new role takes effect on the user's next token refresh (~1h).
    /// Admins cannot change their own role.
    /// </summary>
    [HttpPatch("{id:guid}/role")]
    public async Task<IActionResult> UpdateRole(
        Guid id,
        [FromBody] UpdateUserRoleViewModel vm,
        [FromServices] UpdateUserRoleCommandHandler handler,
        CancellationToken cancellationToken)
    {
        await handler.HandleAsync(id, vm, cancellationToken);
        return NoContent();
    }
}
