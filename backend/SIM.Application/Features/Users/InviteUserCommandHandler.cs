using FluentValidation;
using Microsoft.EntityFrameworkCore;
using SIM.Application.Abstractions;
using SIM.Application.Abstractions.Services;
using SIM.Application.Exceptions;
using SIM.Application.ViewModels.Users;
using SIM.Domain.Abstractions;
using SIM.Domain.Constants;
using SIM.Domain.Entities;
using SIM.Domain.Enums;

namespace SIM.Application.Features.Users;

public class InviteUserCommandHandler(
    IValidator<InviteUserViewModel> validator,
    IIdentityAdminService identityAdminService,
    IUnitOfWork unitOfWork,
    ICurrentUserService currentUserService)
{
    public async Task<UserViewModel> HandleAsync(
        InviteUserViewModel vm,
        CancellationToken cancellationToken = default)
    {
        var validation = await validator.ValidateAsync(vm, cancellationToken);
        if (!validation.IsValid)
            throw new BusinessLogicException(string.Join(" ", validation.Errors.Select(e => e.ErrorMessage)));

        if (!currentUserService.IsSuperAdmin)
        {
            if (vm.Role == UserRole.SuperAdmin)
                throw new BusinessLogicException(ValidationMessages.CannotAssignSuperAdminRole);

            if (vm.OrganizationId != currentUserService.OrganizationId)
                throw new BusinessLogicException(ValidationMessages.OrganizationAccessDenied);
        }

        // SuperAdmin + SimSuporte invariant is enforced by UserProfile.Create() at the domain level.

        var orgExists = await unitOfWork.Organizations
            .AnyAsync(o => o.Id == vm.OrganizationId, cancellationToken);
        if (!orgExists)
            throw new BusinessLogicException(ValidationMessages.OrganizationNotFound);

        var emailTaken = await unitOfWork.UserProfiles
            .AnyAsync(u => u.Email == vm.Email.Trim().ToLowerInvariant(), cancellationToken);
        if (emailTaken)
            throw new BusinessLogicException(ValidationMessages.EmailAlreadyExists);

        var userId = await identityAdminService.InviteUserAsync(vm.Email, cancellationToken);

        var userProfile = UserProfile.Create(userId, vm.FullName, vm.Email, vm.Role, vm.OrganizationId, vm.UnitId);

        unitOfWork.UserProfiles.Add(userProfile);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return new UserViewModel(
            userProfile.Id, userProfile.FullName, userProfile.Email, userProfile.Role,
            userProfile.OrganizationId, userProfile.UnitId, userProfile.CreatedAt, userProfile.IsActive);
    }
}
