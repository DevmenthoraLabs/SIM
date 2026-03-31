using Microsoft.EntityFrameworkCore;
using SIM.Application.Abstractions;
using SIM.Application.Exceptions;
using SIM.Application.ViewModels.Organizations;
using SIM.Domain.Abstractions;
using SIM.Domain.Constants;

namespace SIM.Application.Features.Organizations;

public class GetOrganizationByIdQuery(
    IUnitOfWork unitOfWork,
    ICurrentUserService currentUserService)
{
    public async Task<OrganizationViewModel?> HandleAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var organization = await unitOfWork.Organizations
            .FirstOrDefaultAsync(o => o.Id == id, cancellationToken);

        if (organization is null)
            return null;

        if (!currentUserService.IsSuperAdmin && organization.Id != currentUserService.OrganizationId)
            throw new BusinessLogicException(ValidationMessages.OrganizationAccessDenied);

        return new OrganizationViewModel(
            organization.Id, organization.Name, organization.Cnpj,
            organization.Type, organization.CreatedAt, organization.IsActive);
    }
}
