using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SIM.Application.Abstractions.Services;
using SIM.Application.ViewModels.Products;
using SIM.WebApi.Auth;

namespace SIM.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProductsController(IProductAppService productAppService) : ControllerBase
{
    [HttpPost]
    [Authorize(Roles = Roles.AdminOrStockManager)]
    public async Task<IActionResult> Create(
        [FromBody] CreateProductViewModel vm,
        CancellationToken cancellationToken)
    {
        var result = await productAppService.CreateAsync(vm, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpGet("{id:guid}")]
    [Authorize(Roles = Roles.AllRoles)]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
    {
        var result = await productAppService.GetByIdAsync(id, cancellationToken);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpGet]
    [Authorize(Roles = Roles.AllRoles)]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var result = await productAppService.GetAllAsync(cancellationToken);
        return Ok(result);
    }
}
