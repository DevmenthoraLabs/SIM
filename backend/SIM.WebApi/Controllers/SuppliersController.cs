using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SIM.Application.Features.Suppliers;
using SIM.Application.ViewModels.Suppliers;
using SIM.Domain.Constants;

namespace SIM.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SuppliersController : ControllerBase
{
    [HttpPost]
    [Authorize(Roles = Roles.AdminOrStockManager)]
    public async Task<IActionResult> Create(
        [FromBody] CreateSupplierViewModel vm,
        [FromServices] CreateSupplierCommandHandler handler,
        CancellationToken cancellationToken)
    {
        var result = await handler.HandleAsync(vm, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpGet("{id:guid}")]
    [Authorize(Roles = Roles.AllRoles)]
    public async Task<IActionResult> GetById(
        Guid id,
        [FromServices] GetSupplierByIdQuery query,
        CancellationToken cancellationToken)
    {
        var result = await query.HandleAsync(id, cancellationToken);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpGet]
    [Authorize(Roles = Roles.AllRoles)]
    public async Task<IActionResult> GetAll(
        [FromServices] GetAllSuppliersQuery query,
        CancellationToken cancellationToken)
    {
        var result = await query.HandleAsync(cancellationToken);
        return Ok(result);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = Roles.AdminOrStockManager)]
    public async Task<IActionResult> Update(
        Guid id,
        [FromBody] UpdateSupplierViewModel vm,
        [FromServices] UpdateSupplierCommandHandler handler,
        CancellationToken cancellationToken)
    {
        var result = await handler.HandleAsync(id, vm, cancellationToken);
        return Ok(result);
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = Roles.Admin)]
    public async Task<IActionResult> Deactivate(
        Guid id,
        [FromServices] DeactivateSupplierCommandHandler handler,
        CancellationToken cancellationToken)
    {
        await handler.HandleAsync(id, cancellationToken);
        return NoContent();
    }

    [HttpPut("{id:guid}/reactivate")]
    [Authorize(Roles = Roles.Admin)]
    public async Task<IActionResult> Reactivate(
        Guid id,
        [FromServices] ReactivateSupplierCommandHandler handler,
        CancellationToken cancellationToken)
    {
        await handler.HandleAsync(id, cancellationToken);
        return NoContent();
    }
}
