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
    IValidator<CreateUserViewModel> createValidator,
    IValidator<UpdateUserRoleViewModel> updateRoleValidator,
    IRepository<UserProfile> userProfileRepository,
    IRepository<Organization> organizationRepository,
    ICurrentUserService currentUserService,
    IUnitOfWork unitOfWork) : IUserAppService
{
    public async Task<UserViewModel> CreateAsync(
        CreateUserViewModel vm,
        CancellationToken cancellationToken = default)
    {
        var validation = await createValidator.ValidateAsync(vm, cancellationToken);
        if (!validation.IsValid)
            throw new BusinessLogicException(string.Join(" ", validation.Errors.Select(e => e.ErrorMessage)));

        if (!currentUserService.IsSuperAdmin)
        {
            if (vm.Role == UserRole.SuperAdmin)
                throw new BusinessLogicException(ValidationMessages.CannotAssignSuperAdminRole);

            if (vm.OrganizationId != currentUserService.OrganizationId)
                throw new BusinessLogicException(ValidationMessages.OrganizationAccessDenied);
        }

        _ = await organizationRepository.GetByIdAsync(vm.OrganizationId, cancellationToken)
            ?? throw new BusinessLogicException(ValidationMessages.OrganizationNotFound);

        var userProfile = UserProfile.Create(vm.SupabaseUserId, vm.FullName, vm.Email, vm.Role, vm.OrganizationId, vm.UnitId);

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

        profile.UpdateRole(vm.NewRole);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        // The Custom Access Token Hook reads from user_profiles on every token refresh,
        // so the new role takes effect automatically within the token's lifetime (~1h).
    }

    private static UserViewModel MapToViewModel(UserProfile u) =>
        new(u.Id, u.FullName, u.Email, u.Role, u.OrganizationId, u.UnitId, u.CreatedAt, u.IsActive);
}
