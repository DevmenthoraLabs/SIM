using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SIM.Application.Abstractions.Services;
using SIM.Application.ViewModels.Users;
using SIM.WebApi.Auth;

namespace SIM.WebApi.Controllers.Suporte;

/// <summary>
/// Internal endpoints for the SIM support team (SuperAdmin only).
/// Used to provision the first Admin user for a newly created organization,
/// or to create additional SuperAdmin accounts for the support team.
/// </summary>
[ApiController]
[Route("api/suporte/users")]
[Authorize(Roles = Roles.SuperAdmin)]
[Tags("SIM Suporte")]
public class SuporteUsersController(IUserAppService userAppService) : ControllerBase
{
    /// <summary>
    /// Provisions an application profile for an existing Supabase Auth user.
    /// Can assign any role including Admin (for org onboarding) and SuperAdmin (for support team).
    /// Step 2 of the onboarding workflow — requires the organization to already exist.
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> Create(
        [FromBody] CreateUserViewModel vm,
        CancellationToken cancellationToken)
    {
        var result = await userAppService.CreateAsync(vm, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    /// <summary>
    /// Returns a user profile by ID.
    /// </summary>
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
    {
        var result = await userAppService.GetByIdAsync(id, cancellationToken);
        return result is null ? NotFound() : Ok(result);
    }
}
