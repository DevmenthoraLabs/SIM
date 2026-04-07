using Microsoft.EntityFrameworkCore;
using SIM.Application.Exceptions;
using SIM.Domain.Abstractions;
using SIM.Domain.Constants;

namespace SIM.Application.Features.Categories;

public class DeactivateCategoryCommandHandler(IUnitOfWork unitOfWork)
{
    public async Task HandleAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var category = await unitOfWork.Categories
            .FirstOrDefaultAsync(c => c.Id == id, cancellationToken);
        if (category is null)
            throw new BusinessLogicException(ValidationMessages.CategoryNotFound);

        if (!category.IsActive)
            throw new BusinessLogicException(ValidationMessages.CategoryAlreadyInactive);

        var hasActiveProducts = await unitOfWork.Products
            .AnyAsync(p => p.CategoryId == id && p.IsActive, cancellationToken);
        if (hasActiveProducts)
            throw new BusinessLogicException(ValidationMessages.CategoryHasActiveProducts);

        var hasActiveChildren = await unitOfWork.Categories
            .AnyAsync(c => c.ParentId == id && c.IsActive, cancellationToken);
        if (hasActiveChildren)
            throw new BusinessLogicException(ValidationMessages.CategoryHasActiveChildren);

        category.Deactivate();
        await unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
