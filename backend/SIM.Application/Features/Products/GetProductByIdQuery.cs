using Microsoft.EntityFrameworkCore;
using SIM.Application.ViewModels.Products;
using SIM.Domain.Abstractions;

namespace SIM.Application.Features.Products;

public class GetProductByIdQuery(IUnitOfWork unitOfWork)
{
    public async Task<ProductViewModel?> HandleAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        return await unitOfWork.Products
            .Where(p => p.Id == id)
            .Select(p => new ProductViewModel(
                p.Id, p.Name, p.Description, p.CreatedAt, p.IsActive))
            .FirstOrDefaultAsync(cancellationToken);
    }
}
