using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SIM.Application.Features.Medications;
using SIM.Application.ViewModels.Medications;
using SIM.Domain.Constants;

namespace SIM.WebApi.Controllers;

/// <summary>
/// Medication management endpoints. Medications are products with Type = Medication
/// and an associated MedicationDetails satellite record.
/// Write operations require Admin or StockManager. Read operations are available to all authenticated roles.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class MedicationsController : ControllerBase
{
    [HttpPost]
    [Authorize(Roles = Roles.AdminOrStockManager)]
    public async Task<IActionResult> Create(
        [FromBody] CreateMedicationViewModel vm,
        [FromServices] CreateMedicationCommandHandler handler,
        CancellationToken cancellationToken)
    {
        var result = await handler.HandleAsync(vm, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpGet("{id:guid}")]
    [Authorize(Roles = Roles.AllRoles)]
    public async Task<IActionResult> GetById(
        Guid id,
        [FromServices] GetMedicationByIdQuery query,
        CancellationToken cancellationToken)
    {
        var result = await query.HandleAsync(id, cancellationToken);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpGet]
    [Authorize(Roles = Roles.AllRoles)]
    public async Task<IActionResult> GetAll(
        [FromServices] GetAllMedicationsQuery query,
        CancellationToken cancellationToken)
    {
        var result = await query.HandleAsync(cancellationToken);
        return Ok(result);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = Roles.AdminOrStockManager)]
    public async Task<IActionResult> Update(
        Guid id,
        [FromBody] UpdateMedicationViewModel vm,
        [FromServices] UpdateMedicationCommandHandler handler,
        CancellationToken cancellationToken)
    {
        var result = await handler.HandleAsync(id, vm, cancellationToken);
        return Ok(result);
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = Roles.Admin)]
    public async Task<IActionResult> Deactivate(
        Guid id,
        [FromServices] DeactivateMedicationCommandHandler handler,
        CancellationToken cancellationToken)
    {
        await handler.HandleAsync(id, cancellationToken);
        return NoContent();
    }

    [HttpPut("{id:guid}/reactivate")]
    [Authorize(Roles = Roles.Admin)]
    public async Task<IActionResult> Reactivate(
        Guid id,
        [FromServices] ReactivateMedicationCommandHandler handler,
        CancellationToken cancellationToken)
    {
        await handler.HandleAsync(id, cancellationToken);
        return NoContent();
    }
}
