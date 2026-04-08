using Microsoft.EntityFrameworkCore;
using SIM.Application.Exceptions;
using SIM.Domain.Abstractions;
using SIM.Domain.Constants;
using SIM.Domain.Enums;

namespace SIM.Application.Features.Medications;

public class DeactivateMedicationCommandHandler(IUnitOfWork unitOfWork)
{
    public async Task HandleAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var product = await unitOfWork.Products
            .FirstOrDefaultAsync(p => p.Id == id && p.Type == ProductType.Medication, cancellationToken);

        if (product is null)
            throw new BusinessLogicException(ValidationMessages.MedicationNotFound);

        if (!product.IsActive)
            throw new BusinessLogicException(ValidationMessages.MedicationAlreadyInactive);

        product.Deactivate();
        await unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
