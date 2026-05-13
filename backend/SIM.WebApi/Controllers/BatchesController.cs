using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SIM.Application.Features.Batches;
using SIM.Application.ViewModels.Batches;
using SIM.Domain.Constants;

namespace SIM.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class BatchesController : ControllerBase
{
    [HttpPost]
    [Authorize(Roles = Roles.AdminOrStockManagerOrReceivingOperator)]
    public async Task<IActionResult> Register(
        [FromBody] RegisterBatchViewModel vm,
        [FromServices] RegisterBatchCommandHandler handler,
        CancellationToken cancellationToken)
    {
        var result = await handler.HandleAsync(vm, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpGet("{id:guid}")]
    [Authorize(Roles = Roles.AllRoles)]
    public async Task<IActionResult> GetById(
        Guid id,
        [FromServices] GetBatchByIdQuery query,
        CancellationToken cancellationToken)
    {
        var result = await query.HandleAsync(id, cancellationToken);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpGet("product/{productId:guid}")]
    [Authorize(Roles = Roles.AllRoles)]
    public async Task<IActionResult> GetByProduct(
        Guid productId,
        [FromServices] GetBatchesByProductQuery query,
        CancellationToken cancellationToken)
    {
        var result = await query.HandleAsync(productId, cancellationToken);
        return Ok(result);
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = Roles.Admin)]
    public async Task<IActionResult> Deactivate(
        Guid id,
        [FromServices] DeactivateBatchCommandHandler handler,
        CancellationToken cancellationToken)
    {
        await handler.HandleAsync(id, cancellationToken);
        return NoContent();
    }

    [HttpPut("{id:guid}/reactivate")]
    [Authorize(Roles = Roles.Admin)]
    public async Task<IActionResult> Reactivate(
        Guid id,
        [FromServices] ReactivateBatchCommandHandler handler,
        CancellationToken cancellationToken)
    {
        await handler.HandleAsync(id, cancellationToken);
        return NoContent();
    }
}
