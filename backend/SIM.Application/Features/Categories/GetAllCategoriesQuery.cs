using Microsoft.EntityFrameworkCore;
using SIM.Application.ViewModels.Categories;
using SIM.Domain.Abstractions;

namespace SIM.Application.Features.Categories;

public class GetAllCategoriesQuery(IUnitOfWork unitOfWork)
{
    public async Task<IReadOnlyList<CategoryViewModel>> HandleAsync(
        CancellationToken cancellationToken = default)
    {
        return await unitOfWork.Categories
            .Select(CategoryViewModel.FromEntity)
            .ToListAsync(cancellationToken);
    }
}
