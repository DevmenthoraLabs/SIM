using Microsoft.EntityFrameworkCore;
using SIM.Application.Exceptions;
using SIM.Domain.Abstractions;
using SIM.Domain.Constants;

namespace SIM.Application.Features.Units;

public class DeactivateUnitCommandHandler(IUnitOfWork unitOfWork)
{
    public async Task HandleAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var unit = await unitOfWork.Units
            .FirstOrDefaultAsync(u => u.Id == id, cancellationToken);
        if (unit is null)
            throw new BusinessLogicException(ValidationMessages.UnitNotFound);

        unit.Deactivate();
        await unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
