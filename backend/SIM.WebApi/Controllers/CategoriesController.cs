using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SIM.Application.Features.Categories;
using SIM.Application.ViewModels.Categories;
using SIM.Domain.Constants;

namespace SIM.WebApi.Controllers;

/// <summary>
/// Product category management endpoints.
/// Write operations require Admin. Read operations are available to all authenticated roles.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CategoriesController : ControllerBase
{
    [HttpPost]
    [Authorize(Roles = Roles.Admin)]
    public async Task<IActionResult> Create(
        [FromBody] CreateCategoryViewModel vm,
        [FromServices] CreateCategoryCommandHandler handler,
        CancellationToken cancellationToken)
    {
        var result = await handler.HandleAsync(vm, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpGet("{id:guid}")]
    [Authorize(Roles = Roles.AllRoles)]
    public async Task<IActionResult> GetById(
        Guid id,
        [FromServices] GetCategoryByIdQuery query,
        CancellationToken cancellationToken)
    {
        var result = await query.HandleAsync(id, cancellationToken);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpGet]
    [Authorize(Roles = Roles.AllRoles)]
    public async Task<IActionResult> GetAll(
        [FromServices] GetAllCategoriesQuery query,
        CancellationToken cancellationToken)
    {
        var result = await query.HandleAsync(cancellationToken);
        return Ok(result);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = Roles.Admin)]
    public async Task<IActionResult> Update(
        Guid id,
        [FromBody] UpdateCategoryViewModel vm,
        [FromServices] UpdateCategoryCommandHandler handler,
        CancellationToken cancellationToken)
    {
        var result = await handler.HandleAsync(id, vm, cancellationToken);
        return Ok(result);
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = Roles.Admin)]
    public async Task<IActionResult> Deactivate(
        Guid id,
        [FromServices] DeactivateCategoryCommandHandler handler,
        CancellationToken cancellationToken)
    {
        await handler.HandleAsync(id, cancellationToken);
        return NoContent();
    }
}
