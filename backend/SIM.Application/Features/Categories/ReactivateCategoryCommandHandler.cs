using Microsoft.EntityFrameworkCore;
using SIM.Application.Exceptions;
using SIM.Domain.Abstractions;
using SIM.Domain.Constants;

namespace SIM.Application.Features.Categories;

public class ReactivateCategoryCommandHandler(IUnitOfWork unitOfWork)
{
    public async Task HandleAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var category = await unitOfWork.Categories
            .FirstOrDefaultAsync(c => c.Id == id, cancellationToken);

        if (category is null)
            throw new BusinessLogicException(ValidationMessages.CategoryNotFound);

        if (category.IsActive)
            throw new BusinessLogicException(ValidationMessages.CategoryAlreadyActive);

        var nameConflict = await unitOfWork.Categories
            .AnyAsync(c => c.Name == category.Name && c.Id != id && c.IsActive, cancellationToken);

        if (nameConflict)
            throw new BusinessLogicException(ValidationMessages.CategoryNameAlreadyExists);

        category.Reactivate();
        await unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
