using Microsoft.EntityFrameworkCore;
using SIM.Application.ViewModels.Categories;
using SIM.Domain.Abstractions;

namespace SIM.Application.Features.Categories;

public class GetCategoryByIdQuery(IUnitOfWork unitOfWork)
{
    public async Task<CategoryViewModel?> HandleAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        return await unitOfWork.Categories
            .Where(c => c.Id == id)
            .Select(CategoryViewModel.FromEntity)
            .FirstOrDefaultAsync(cancellationToken);
    }
}
