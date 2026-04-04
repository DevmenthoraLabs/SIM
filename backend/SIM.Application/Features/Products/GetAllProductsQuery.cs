using Microsoft.EntityFrameworkCore;
using SIM.Application.ViewModels.Products;
using SIM.Domain.Abstractions;

namespace SIM.Application.Features.Products;

public class GetAllProductsQuery(IUnitOfWork unitOfWork)
{
    public async Task<IReadOnlyList<ProductViewModel>> HandleAsync(
        CancellationToken cancellationToken = default)
    {
        return await unitOfWork.Products
            .Select(ProductViewModel.FromEntity)
            .ToListAsync(cancellationToken);
    }
}
