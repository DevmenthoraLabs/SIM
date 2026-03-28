using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SIM.Application.Abstractions.Services;
using SIM.WebApi.Auth;

namespace SIM.WebApi.Controllers;

/// <summary>
/// Organization read endpoints for authenticated org-level users.
/// Write operations (create, list all) are restricted to the SIM Suporte area.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class OrganizationsController(IOrganizationAppService organizationAppService) : ControllerBase
{
    /// <summary>
    /// Returns a specific organization by ID.
    /// </summary>
    [HttpGet("{id:guid}")]
    [Authorize(Roles = Roles.AdminOrStockManager)]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
    {
        var result = await organizationAppService.GetByIdAsync(id, cancellationToken);
        return result is null ? NotFound() : Ok(result);
    }
}
