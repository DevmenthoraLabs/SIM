using Microsoft.EntityFrameworkCore;
using SIM.Application.Exceptions;
using SIM.Domain.Abstractions;
using SIM.Domain.Constants;
using SIM.Domain.Entities;
using SIM.Domain.Enums;

namespace SIM.Application.Features.Units;

public class AssignUserToUnitCommandHandler(IUnitOfWork unitOfWork)
{
    public async Task HandleAsync(
        Guid unitId,
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        var unit = await unitOfWork.Units
            .FirstOrDefaultAsync(u => u.Id == unitId && u.IsActive, cancellationToken);
        if (unit is null)
            throw new NotFoundException(ValidationMessages.UnitNotFound);

        var user = await unitOfWork.UserProfiles
            .FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);
        if (user is null)
            throw new NotFoundException(ValidationMessages.UserNotFound);

        if (user.Role == UserRole.SuperAdmin)
            throw new BusinessLogicException(ValidationMessages.SuperAdminCannotBeAssignedToUnit);

        var activeBindingExists = await unitOfWork.UserUnits
            .AnyAsync(uu => uu.UserId == userId && uu.UnitId == unitId && uu.IsActive, cancellationToken);
        if (activeBindingExists)
            throw new ConflictException(ValidationMessages.UserUnitAlreadyActive);

        var userUnit = UserUnit.Create(userId, unitId, unit.OrganizationId);

        unitOfWork.UserUnits.Add(userUnit);
        await unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
