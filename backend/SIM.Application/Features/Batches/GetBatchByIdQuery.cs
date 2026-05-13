using Microsoft.EntityFrameworkCore;
using SIM.Application.ViewModels.Batches;
using SIM.Domain.Abstractions;

namespace SIM.Application.Features.Batches;

public class GetBatchByIdQuery(IUnitOfWork unitOfWork)
{
    public async Task<BatchViewModel?> HandleAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        return await unitOfWork.Batches
            .Where(b => b.Id == id)
            .Select(BatchViewModel.FromEntity)
            .FirstOrDefaultAsync(cancellationToken);
    }
}
