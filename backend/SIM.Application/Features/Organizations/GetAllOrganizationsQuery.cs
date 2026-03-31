using Microsoft.EntityFrameworkCore;
using SIM.Application.ViewModels.Organizations;
using SIM.Domain.Abstractions;

namespace SIM.Application.Features.Organizations;

public class GetAllOrganizationsQuery(IUnitOfWork unitOfWork)
{
    public async Task<IReadOnlyList<OrganizationViewModel>> HandleAsync(
        CancellationToken cancellationToken = default)
    {
        return await unitOfWork.Organizations
            .Select(o => new OrganizationViewModel(
                o.Id, o.Name, o.Cnpj, o.Type, o.CreatedAt, o.IsActive))
            .ToListAsync(cancellationToken);
    }
}
