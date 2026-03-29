using SIM.Application.ViewModels.Organizations;

namespace SIM.Application.Abstractions.Services;

public interface IOrganizationAppService
{
    Task<OrganizationViewModel> CreateAsync(CreateOrganizationViewModel vm, CancellationToken cancellationToken = default);
    Task<OrganizationViewModel?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<OrganizationViewModel>> GetAllAsync(CancellationToken cancellationToken = default);
}
