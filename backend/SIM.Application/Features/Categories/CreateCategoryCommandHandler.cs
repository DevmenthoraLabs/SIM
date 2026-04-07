using FluentValidation;
using Microsoft.EntityFrameworkCore;
using SIM.Application.Abstractions;
using SIM.Application.Exceptions;
using SIM.Application.ViewModels.Categories;
using SIM.Domain.Abstractions;
using SIM.Domain.Constants;
using SIM.Domain.Entities;

namespace SIM.Application.Features.Categories;

public class CreateCategoryCommandHandler(
    IValidator<CreateCategoryViewModel> validator,
    IUnitOfWork unitOfWork,
    ICurrentUserService currentUserService)
{
    public async Task<CategoryViewModel> HandleAsync(
        CreateCategoryViewModel vm,
        CancellationToken cancellationToken = default)
    {
        var validation = await validator.ValidateAsync(vm, cancellationToken);
        if (!validation.IsValid)
            throw new BusinessLogicException(string.Join(" ", validation.Errors.Select(e => e.ErrorMessage)));

        var organizationId = currentUserService.OrganizationId!.Value;

        var nameExists = await unitOfWork.Categories
            .AnyAsync(c => c.Name == vm.Name.Trim(), cancellationToken);
        if (nameExists)
            throw new BusinessLogicException(ValidationMessages.CategoryNameAlreadyExists);

        if (vm.ParentId is not null)
        {
            var parent = await unitOfWork.Categories
                .FirstOrDefaultAsync(c => c.Id == vm.ParentId, cancellationToken);

            if (parent is null)
                throw new BusinessLogicException(ValidationMessages.CategoryParentNotFound);

            if (!parent.IsActive)
                throw new BusinessLogicException(ValidationMessages.CategoryParentInactive);

            if (parent.ParentId is not null)
                throw new BusinessLogicException(ValidationMessages.CategoryParentMustBeRoot);
        }

        var category = Category.Create(vm.Name, vm.ParentId, organizationId);

        unitOfWork.Categories.Add(category);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return CategoryViewModel.From(category);
    }
}
