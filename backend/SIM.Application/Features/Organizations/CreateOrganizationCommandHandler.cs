using FluentValidation;
using SIM.Application.Exceptions;
using SIM.Application.ViewModels.Organizations;
using SIM.Domain.Abstractions;
using SIM.Domain.Entities;

namespace SIM.Application.Features.Organizations;

public class CreateOrganizationCommandHandler(
    IValidator<CreateOrganizationViewModel> validator,
    IUnitOfWork unitOfWork)
{
    public async Task<OrganizationViewModel> HandleAsync(
        CreateOrganizationViewModel vm,
        CancellationToken cancellationToken = default)
    {
        var validation = await validator.ValidateAsync(vm, cancellationToken);
        if (!validation.IsValid)
            throw new BusinessLogicException(string.Join(" ", validation.Errors.Select(e => e.ErrorMessage)));

        var organization = Organization.Create(vm.Name, vm.Cnpj, vm.Type);

        unitOfWork.Organizations.Add(organization);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return new OrganizationViewModel(
            organization.Id, organization.Name, organization.Cnpj,
            organization.Type, organization.CreatedAt, organization.IsActive);
    }
}
