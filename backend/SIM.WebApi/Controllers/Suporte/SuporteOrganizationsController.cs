using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SIM.Application.Features.Organizations;
using SIM.Application.ViewModels.Organizations;
using SIM.Domain.Constants;

namespace SIM.WebApi.Controllers.Suporte;

/// <summary>
/// Internal endpoints for the SIM support team (SuperAdmin only).
/// Used to onboard new client organizations and their first Admin user.
/// These routes are NOT available to organization-level Admins.
/// </summary>
[ApiController]
[Route("api/suporte/organizations")]
[Authorize(Policy = Policies.SimSuporte)]
[Tags("SIM Suporte")]
public class SuporteOrganizationsController : ControllerBase
{
    /// <summary>
    /// Creates a new client organization (e.g., a pharmacy network).
    /// Step 1 of the onboarding workflow — must be done before creating the org's Admin user.
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> Create(
        [FromBody] CreateOrganizationViewModel vm,
        [FromServices] CreateOrganizationCommandHandler handler,
        CancellationToken cancellationToken)
    {
        var result = await handler.HandleAsync(vm, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    /// <summary>
    /// Returns a specific organization by ID.
    /// </summary>
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(
        Guid id,
        [FromServices] GetOrganizationByIdQuery query,
        CancellationToken cancellationToken)
    {
        var result = await query.HandleAsync(id, cancellationToken);
        return result is null ? NotFound() : Ok(result);
    }

    /// <summary>
    /// Returns all registered organizations.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromServices] GetAllOrganizationsQuery query,
        CancellationToken cancellationToken)
    {
        var result = await query.HandleAsync(cancellationToken);
        return Ok(result);
    }
}
