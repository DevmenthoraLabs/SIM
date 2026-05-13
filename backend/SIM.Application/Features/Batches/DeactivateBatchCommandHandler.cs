using Microsoft.EntityFrameworkCore;
using SIM.Application.Exceptions;
using SIM.Domain.Abstractions;
using SIM.Domain.Constants;

namespace SIM.Application.Features.Batches;

public class DeactivateBatchCommandHandler(IUnitOfWork unitOfWork)
{
    public async Task HandleAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var batch = await unitOfWork.Batches
            .FirstOrDefaultAsync(b => b.Id == id, cancellationToken);

        if (batch is null)
            throw new BusinessLogicException(ValidationMessages.BatchNotFound);

        if (!batch.IsActive)
            throw new BusinessLogicException(ValidationMessages.BatchAlreadyInactive);

        batch.Deactivate();
        await unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
