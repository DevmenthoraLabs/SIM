using FluentValidation;
using Microsoft.EntityFrameworkCore;
using SIM.Application.Abstractions;
using SIM.Application.Exceptions;
using SIM.Application.ViewModels.Medications;
using SIM.Domain.Abstractions;
using SIM.Domain.Constants;
using SIM.Domain.Entities;

namespace SIM.Application.Features.Medications;

public class CreateMedicationCommandHandler(
    IValidator<CreateMedicationViewModel> validator,
    IUnitOfWork unitOfWork,
    ICurrentUserService currentUserService)
{
    public async Task<MedicationViewModel> HandleAsync(
        CreateMedicationViewModel vm,
        CancellationToken cancellationToken = default)
    {
        var validation = await validator.ValidateAsync(vm, cancellationToken);
        if (!validation.IsValid)
            throw new BusinessLogicException(string.Join(" ", validation.Errors.Select(e => e.ErrorMessage)));

        if (vm.CategoryId is not null)
        {
            var category = await unitOfWork.Categories
                .FirstOrDefaultAsync(c => c.Id == vm.CategoryId, cancellationToken);

            if (category is null)
                throw new BusinessLogicException(ValidationMessages.CategoryNotFound);

            if (!category.IsActive)
                throw new BusinessLogicException(ValidationMessages.CategoryInactive);
        }

        var product = Product.CreateMedication(
            vm.Name,
            vm.Description,
            vm.BarCode,
            vm.CategoryId,
            currentUserService.OrganizationId!.Value,
            vm.GenericName,
            vm.ActiveIngredient,
            vm.Presentation,
            vm.Concentration,
            vm.IsControlled);

        unitOfWork.Products.Add(product);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return MedicationViewModel.From(product);
    }
}
