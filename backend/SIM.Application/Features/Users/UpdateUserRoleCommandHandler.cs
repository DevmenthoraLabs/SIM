using FluentValidation;
using Microsoft.EntityFrameworkCore;
using SIM.Application.Abstractions;
using SIM.Application.Exceptions;
using SIM.Application.ViewModels.Users;
using SIM.Domain.Abstractions;
using SIM.Domain.Constants;
using SIM.Domain.Enums;

namespace SIM.Application.Features.Users;

public class UpdateUserRoleCommandHandler(
    IValidator<UpdateUserRoleViewModel> validator,
    IUnitOfWork unitOfWork,
    ICurrentUserService currentUserService)
{
    public async Task HandleAsync(
        Guid userId,
        UpdateUserRoleViewModel vm,
        CancellationToken cancellationToken = default)
    {
        var validation = await validator.ValidateAsync(vm, cancellationToken);
        if (!validation.IsValid)
            throw new BusinessLogicException(string.Join(" ", validation.Errors.Select(e => e.ErrorMessage)));

        var profile = await unitOfWork.UserProfiles
            .FirstOrDefaultAsync(u => u.Id == userId, cancellationToken)
            ?? throw new BusinessLogicException(ValidationMessages.UserNotFound);

        if (!currentUserService.IsSuperAdmin)
        {
            if (vm.NewRole == UserRole.SuperAdmin)
                throw new BusinessLogicException(ValidationMessages.CannotAssignSuperAdminRole);

            if (profile.Id == currentUserService.UserId)
                throw new BusinessLogicException(ValidationMessages.CannotChangeOwnRole);
        }

        // SuperAdmin + SimSuporte invariant is enforced by UserProfile.UpdateRole() at the domain level.

        profile.UpdateRole(vm.NewRole);
        await unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
