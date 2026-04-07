using FluentValidation;
using Microsoft.EntityFrameworkCore;
using SIM.Application.Exceptions;
using SIM.Application.ViewModels.Units;
using SIM.Domain.Abstractions;
using SIM.Domain.Constants;

namespace SIM.Application.Features.Units;

public class UpdateUnitCommandHandler(
    IValidator<UpdateUnitViewModel> validator,
    IUnitOfWork unitOfWork)
{
    public async Task<UnitViewModel> HandleAsync(
        Guid id,
        UpdateUnitViewModel vm,
        CancellationToken cancellationToken = default)
    {
        var validation = await validator.ValidateAsync(vm, cancellationToken);
        if (!validation.IsValid)
            throw new BusinessLogicException(string.Join(" ", validation.Errors.Select(e => e.ErrorMessage)));

        var unit = await unitOfWork.Units
            .FirstOrDefaultAsync(u => u.Id == id, cancellationToken);
        if (unit is null)
            throw new BusinessLogicException(ValidationMessages.UnitNotFound);
        if (!unit.IsActive)
            throw new BusinessLogicException(ValidationMessages.UnitInactive);

        var codeConflict = await unitOfWork.Units
            .AnyAsync(u => u.Code == vm.Code.Trim() && u.Id != id, cancellationToken);
        if (codeConflict)
            throw new BusinessLogicException(ValidationMessages.UnitCodeAlreadyExists);

        unit.Update(vm.Name, vm.Code, vm.Address, vm.Phone);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return UnitViewModel.From(unit);
    }
}
