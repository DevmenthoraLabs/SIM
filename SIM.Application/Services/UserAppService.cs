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
        var userProfile = await userProfileRepository.GetByIdAsync(id, cancellationToken);

        if (userProfile is null)
            return null;

        if (!currentUserService.IsSuperAdmin && userProfile.OrganizationId != currentUserService.OrganizationId)
            throw new BusinessLogicException(ValidationMessages.OrganizationAccessDenied);

        return MapToViewModel(userProfile);
    }

    private static UserViewModel MapToViewModel(UserProfile u) =>
        new(u.Id, u.FullName, u.Email, u.Role, u.OrganizationId, u.UnitId, u.CreatedAt, u.IsActive);
}
