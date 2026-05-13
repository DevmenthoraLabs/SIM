using Microsoft.EntityFrameworkCore;
using SIM.Application.ViewModels.Batches;
using SIM.Domain.Abstractions;

namespace SIM.Application.Features.Batches;

public class GetBatchesByProductQuery(IUnitOfWork unitOfWork)
{
    public async Task<IReadOnlyList<BatchViewModel>> HandleAsync(
        Guid productId,
        CancellationToken cancellationToken = default)
    {
        return await unitOfWork.Batches
            .Where(b => b.ProductId == productId)
            .Select(BatchViewModel.FromEntity)
            .ToListAsync(cancellationToken);
    }
}
