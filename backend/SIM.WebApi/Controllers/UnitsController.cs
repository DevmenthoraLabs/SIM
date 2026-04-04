using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SIM.Application.Abstractions;
using SIM.Application.Features.Units;
using SIM.Application.ViewModels.Units;
using SIM.Domain.Constants;

namespace SIM.WebApi.Controllers;

/// <summary>
/// Unit (filial) management endpoints.
/// CRUD operations require Admin. Read operations are available to all authenticated roles.
/// User-Unit assignment management requires Admin.
/// GetUnitUsers is available to Admin or any member of the unit.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UnitsController : ControllerBase
{
    [HttpPost]
    [Authorize(Roles = Roles.Admin)]
    public async Task<IActionResult> Create(
        [FromBody] CreateUnitViewModel vm,
        [FromServices] CreateUnitCommandHandler handler,
        CancellationToken cancellationToken)
    {
        var result = await handler.HandleAsync(vm, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpGet("{id:guid}")]
    [Authorize(Roles = Roles.AllRoles)]
    public async Task<IActionResult> GetById(
        Guid id,
        [FromServices] GetUnitByIdQuery query,
        CancellationToken cancellationToken)
    {
        var result = await query.HandleAsync(id, cancellationToken);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpGet]
    [Authorize(Roles = Roles.AllRoles)]
    public async Task<IActionResult> GetAll(
        [FromServices] GetAllUnitsQuery query,
        CancellationToken cancellationToken)
    {
        var result = await query.HandleAsync(cancellationToken);
        return Ok(result);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = Roles.Admin)]
    public async Task<IActionResult> Update(
        Guid id,
        [FromBody] UpdateUnitViewModel vm,
        [FromServices] UpdateUnitCommandHandler handler,
        CancellationToken cancellationToken)
    {
        var result = await handler.HandleAsync(id, vm, cancellationToken);
        return Ok(result);
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = Roles.Admin)]
    public async Task<IActionResult> Deactivate(
        Guid id,
        [FromServices] DeactivateUnitCommandHandler handler,
        CancellationToken cancellationToken)
    {
        await handler.HandleAsync(id, cancellationToken);
        return NoContent();
    }

    // ── User-Unit management ──────────────────────────────────────────────────

    [HttpPost("{unitId:guid}/users/{userId:guid}")]
    [Authorize(Roles = Roles.Admin)]
    public async Task<IActionResult> AssignUser(
        Guid unitId,
        Guid userId,
        [FromServices] AssignUserToUnitCommandHandler handler,
        CancellationToken cancellationToken)
    {
        await handler.HandleAsync(unitId, userId, cancellationToken);
        return NoContent();
    }

    [HttpDelete("{unitId:guid}/users/{userId:guid}")]
    [Authorize(Roles = Roles.Admin)]
    public async Task<IActionResult> RemoveUser(
        Guid unitId,
        Guid userId,
        [FromServices] RemoveUserFromUnitCommandHandler handler,
        CancellationToken cancellationToken)
    {
        await handler.HandleAsync(unitId, userId, cancellationToken);
        return NoContent();
    }

    /// <summary>
    /// Returns the active members of a unit.
    /// Accessible by Admin (cross-unit) or any user who is an active member of the unit.
    /// </summary>
    [HttpGet("{unitId:guid}/users")]
    [Authorize(Roles = Roles.AllRoles)]
    public async Task<IActionResult> GetUnitUsers(
        Guid unitId,
        [FromServices] GetUnitUsersQuery query,
        [FromServices] ICurrentUserService currentUserService,
        CancellationToken cancellationToken)
    {
        if (!currentUserService.HasAccessToUnit(unitId))
            return Forbid();

        var result = await query.HandleAsync(unitId, cancellationToken);
        return Ok(result);
    }
}
