using FluentValidation;
using Microsoft.EntityFrameworkCore;
using SIM.Application.Abstractions;
using SIM.Application.Exceptions;
using SIM.Application.ViewModels.Units;
using SIM.Domain.Abstractions;
using SIM.Domain.Constants;
using SIM.Domain.Entities;

namespace SIM.Application.Features.Units;

public class CreateUnitCommandHandler(
    IValidator<CreateUnitViewModel> validator,
    IUnitOfWork unitOfWork,
    ICurrentUserService currentUserService)
{
    public async Task<UnitViewModel> HandleAsync(
        CreateUnitViewModel vm,
        CancellationToken cancellationToken = default)
    {
        var validation = await validator.ValidateAsync(vm, cancellationToken);
        if (!validation.IsValid)
            throw new BusinessLogicException(string.Join(" ", validation.Errors.Select(e => e.ErrorMessage)));

        var organizationId = currentUserService.OrganizationId!.Value;

        var orgExists = await unitOfWork.Organizations
            .AnyAsync(o => o.Id == organizationId && o.IsActive, cancellationToken);
        if (!orgExists)
            throw new BusinessLogicException(ValidationMessages.OrganizationNotFound);

        var codeExists = await unitOfWork.Units
            .AnyAsync(u => u.Code == vm.Code.Trim(), cancellationToken);
        if (codeExists)
            throw new BusinessLogicException(ValidationMessages.UnitCodeAlreadyExists);

        var unit = Unit.Create(vm.Name, vm.Code, vm.Address, vm.Phone, organizationId);

        unitOfWork.Units.Add(unit);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return UnitViewModel.From(unit);
    }
}
