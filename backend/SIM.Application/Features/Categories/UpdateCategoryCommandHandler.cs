using FluentValidation;
using Microsoft.EntityFrameworkCore;
using SIM.Application.Exceptions;
using SIM.Application.ViewModels.Categories;
using SIM.Domain.Abstractions;
using SIM.Domain.Constants;

namespace SIM.Application.Features.Categories;

public class UpdateCategoryCommandHandler(
    IValidator<UpdateCategoryViewModel> validator,
    IUnitOfWork unitOfWork)
{
    public async Task<CategoryViewModel> HandleAsync(
        Guid id,
        UpdateCategoryViewModel vm,
        CancellationToken cancellationToken = default)
    {
        var validation = await validator.ValidateAsync(vm, cancellationToken);
        if (!validation.IsValid)
            throw new BusinessLogicException(string.Join(" ", validation.Errors.Select(e => e.ErrorMessage)));

        var category = await unitOfWork.Categories
            .FirstOrDefaultAsync(c => c.Id == id, cancellationToken);
        if (category is null)
            throw new BusinessLogicException(ValidationMessages.CategoryNotFound);

        if (!category.IsActive)
            throw new BusinessLogicException(ValidationMessages.CategoryInactive);

        var nameConflict = await unitOfWork.Categories
            .AnyAsync(c => c.Name == vm.Name.Trim() && c.Id != id && c.IsActive, cancellationToken);
        if (nameConflict)
            throw new BusinessLogicException(ValidationMessages.CategoryNameAlreadyExists);

        if (vm.ParentId is not null)
        {
            if (vm.ParentId == id)
                throw new BusinessLogicException(ValidationMessages.CategoryCannotBeItsOwnParent);

            var parent = await unitOfWork.Categories
                .FirstOrDefaultAsync(c => c.Id == vm.ParentId, cancellationToken);

            if (parent is null)
                throw new BusinessLogicException(ValidationMessages.CategoryParentNotFound);

            if (!parent.IsActive)
                throw new BusinessLogicException(ValidationMessages.CategoryParentInactive);

            if (parent.ParentId is not null)
                throw new BusinessLogicException(ValidationMessages.CategoryParentMustBeRoot);
        }

        category.Update(vm.Name, vm.ParentId);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return CategoryViewModel.From(category);
    }
}
