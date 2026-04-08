using FluentValidation;
using Microsoft.EntityFrameworkCore;
using SIM.Application.Exceptions;
using SIM.Application.ViewModels.Medications;
using SIM.Domain.Abstractions;
using SIM.Domain.Constants;
using SIM.Domain.Enums;

namespace SIM.Application.Features.Medications;

public class UpdateMedicationCommandHandler(
    IValidator<UpdateMedicationViewModel> validator,
    IUnitOfWork unitOfWork)
{
    public async Task<MedicationViewModel> HandleAsync(
        Guid id,
        UpdateMedicationViewModel vm,
        CancellationToken cancellationToken = default)
    {
        var validation = await validator.ValidateAsync(vm, cancellationToken);
        if (!validation.IsValid)
            throw new BusinessLogicException(string.Join(" ", validation.Errors.Select(e => e.ErrorMessage)));

        var product = await unitOfWork.Products
            .Include(p => p.MedicationDetails)
            .FirstOrDefaultAsync(p => p.Id == id && p.Type == ProductType.Medication, cancellationToken);

        if (product is null)
            throw new BusinessLogicException(ValidationMessages.MedicationNotFound);

        if (!product.IsActive)
            throw new BusinessLogicException(ValidationMessages.MedicationInactive);

        if (vm.CategoryId is not null)
        {
            var category = await unitOfWork.Categories
                .FirstOrDefaultAsync(c => c.Id == vm.CategoryId, cancellationToken);

            if (category is null)
                throw new BusinessLogicException(ValidationMessages.CategoryNotFound);

            if (!category.IsActive)
                throw new BusinessLogicException(ValidationMessages.CategoryInactive);
        }

        product.Update(vm.Name, vm.Description, vm.BarCode, vm.CategoryId);
        product.UpdateMedicationDetails(
            vm.GenericName,
            vm.ActiveIngredient,
            vm.Presentation,
            vm.Concentration,
            vm.IsControlled);

        await unitOfWork.SaveChangesAsync(cancellationToken);

        return MedicationViewModel.From(product);
    }
}
