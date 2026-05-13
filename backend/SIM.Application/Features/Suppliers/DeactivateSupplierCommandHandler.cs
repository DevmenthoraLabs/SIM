using Microsoft.EntityFrameworkCore;
using SIM.Application.Exceptions;
using SIM.Domain.Abstractions;
using SIM.Domain.Constants;

namespace SIM.Application.Features.Suppliers;

public class DeactivateSupplierCommandHandler(IUnitOfWork unitOfWork)
{
    public async Task HandleAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var supplier = await unitOfWork.Suppliers
            .FirstOrDefaultAsync(s => s.Id == id, cancellationToken);

        if (supplier is null)
            throw new BusinessLogicException(ValidationMessages.SupplierNotFound);

        if (!supplier.IsActive)
            throw new BusinessLogicException(ValidationMessages.SupplierAlreadyInactive);

        supplier.Deactivate();
        await unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
