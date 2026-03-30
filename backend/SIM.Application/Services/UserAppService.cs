using FluentValidation;
using SIM.Application.Abstractions;
using SIM.Application.Abstractions.Services;
using SIM.Application.Exceptions;
using SIM.Application.ViewModels.Users;
using SIM.Domain.Abstractions;
using SIM.Domain.Constants;
using SIM.Domain.Entities;
using SIM.Domain.Enums;

namespace SIM.Application.Services;

public class UserAppService(
    IValidator<InviteUserViewModel> inviteValidator,
    IValidator<UpdateUserRoleViewModel> updateRoleValidator,
    IIdentityAdminService identityAdminService,
    IRepository<UserProfile> userProfileRepository,
    IRepository<Organization> organizationRepository,
    ICurrentUserService currentUserService,
    IUnitOfWork unitOfWork) : IUserAppService
{
    public async Task<UserViewModel> InviteAsync(
        InviteUserViewModel vm,
        CancellationToken cancellationToken = default)
    {
        var validation = await inviteValidator.ValidateAsync(vm, cancellationToken);
        if (!validation.IsValid)
            throw new BusinessLogicException(string.Join(" ", validation.Errors.Select(e => e.ErrorMessage)));

        if (!currentUserService.IsSuperAdmin)
        {
            if (vm.Role == UserRole.SuperAdmin)
                throw new BusinessLogicException(ValidationMessages.CannotAssignSuperAdminRole);

            if (vm.OrganizationId != currentUserService.OrganizationId)
                throw new BusinessLogicException(ValidationMessages.OrganizationAccessDenied);
        }

        // SuperAdmin users must always belong to the SimSuporte organization — no exceptions.
        if (vm.Role == UserRole.SuperAdmin && vm.OrganizationId != SystemOrganizations.SimSuporte)
            throw new BusinessLogicException(ValidationMessages.SuperAdminMustBelongToSimSuporte);

        _ = await organizationRepository.GetByIdAsync(vm.OrganizationId, cancellationToken)
            ?? throw new BusinessLogicException(ValidationMessages.OrganizationNotFound);

        var emailTaken = await userProfileRepository.AnyAsync(
            u => u.Email == vm.Email.Trim().ToLowerInvariant(), cancellationToken);
        if (emailTaken)
            throw new BusinessLogicException(ValidationMessages.EmailAlreadyExists);

        // Invite user in the external auth provider — creates the account and sends invitation email.
        // The returned UUID is used immediately to create the UserProfile.
        var userId = await identityAdminService.InviteUserAsync(vm.Email, cancellationToken);

        var userProfile = UserProfile.Create(userId, vm.FullName, vm.Email, vm.Role, vm.OrganizationId, vm.UnitId);

        await userProfileRepository.AddAsync(userProfile, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return MapToViewModel(userProfile);
    }

    public async Task<UserViewModel?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        // Global query filter on UserProfile scopes to current user's org automatically.
        // Cross-org access returns null (404) instead of a 400, eliminating user enumeration.
        var userProfile = await userProfileRepository.GetByIdAsync(id, cancellationToken);
        return userProfile is null ? null : MapToViewModel(userProfile);
    }

    public async Task UpdateRoleAsync(
        Guid userId,
        UpdateUserRoleViewModel vm,
        CancellationToken cancellationToken = default)
    {
        var validation = await updateRoleValidator.ValidateAsync(vm, cancellationToken);
        if (!validation.IsValid)
            throw new BusinessLogicException(string.Join(" ", validation.Errors.Select(e => e.ErrorMessage)));

        var profile = await userProfileRepository.GetByIdAsync(userId, cancellationToken)
            ?? throw new BusinessLogicException(ValidationMessages.UserNotFound);

        if (!currentUserService.IsSuperAdmin)
        {
            // Note: cross-org access is already blocked by the Global Query Filter —
            // GetByIdAsync returns null (UserNotFound) before this block is reached.
            if (vm.NewRole == UserRole.SuperAdmin)
                throw new BusinessLogicException(ValidationMessages.CannotAssignSuperAdminRole);

            if (profile.Id == currentUserService.UserId)
                throw new BusinessLogicException(ValidationMessages.CannotChangeOwnRole);
        }

        // Enforce SuperAdmin org invariant on role changes as well.
        if (vm.NewRole == UserRole.SuperAdmin && profile.OrganizationId != SystemOrganizations.SimSuporte)
            throw new BusinessLogicException(ValidationMessages.SuperAdminMustBelongToSimSuporte);

        profile.UpdateRole(vm.NewRole);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        // The Custom Access Token Hook reads from user_profiles on every token refresh,
        // so the new role takes effect automatically within the token's lifetime (~1h).
    }

    private static UserViewModel MapToViewModel(UserProfile u) =>
        new(u.Id, u.FullName, u.Email, u.Role, u.OrganizationId, u.UnitId, u.CreatedAt, u.IsActive);
}
