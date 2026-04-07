using Microsoft.EntityFrameworkCore;
using SIM.Application.Exceptions;
using SIM.Domain.Abstractions;
using SIM.Domain.Constants;
using SIM.Domain.Enums;

namespace SIM.Application.Features.Units;

public class RemoveUserFromUnitCommandHandler(IUnitOfWork unitOfWork)
{
    public async Task HandleAsync(
        Guid unitId,
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        var userUnit = await unitOfWork.UserUnits
            .FirstOrDefaultAsync(uu => uu.UnitId == unitId && uu.UserId == userId && uu.IsActive, cancellationToken);
        if (userUnit is null)
            throw new NotFoundException(ValidationMessages.UserUnitNotFound);

        var user = await unitOfWork.UserProfiles
            .FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);

        if (user is not null)
        {
            var isOperationalRole = user.Role is UserRole.Pharmacist or UserRole.StockManager or UserRole.ReceivingOperator;

            if (isOperationalRole)
            {
                var remainingActiveUnits = await unitOfWork.UserUnits
                    .CountAsync(uu => uu.UserId == userId && uu.IsActive && uu.UnitId != unitId, cancellationToken);

                if (remainingActiveUnits == 0)
                    throw new BusinessLogicException(ValidationMessages.CannotRemoveLastUnitAssignment);
            }
        }

        userUnit.Deactivate();
        await unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
