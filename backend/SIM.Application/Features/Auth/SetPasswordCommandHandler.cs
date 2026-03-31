using FluentValidation;
using SIM.Application.Abstractions;
using SIM.Application.Abstractions.Services;
using SIM.Application.Exceptions;
using SIM.Application.ViewModels.Auth;

namespace SIM.Application.Features.Auth;

public class SetPasswordCommandHandler(
    IValidator<SetPasswordViewModel> validator,
    IIdentityAdminService identityAdminService,
    ICurrentUserService currentUserService)
{
    public async Task HandleAsync(
        SetPasswordViewModel vm,
        CancellationToken cancellationToken = default)
    {
        var validation = await validator.ValidateAsync(vm, cancellationToken);
        if (!validation.IsValid)
            throw new BusinessLogicException(string.Join(" ", validation.Errors.Select(e => e.ErrorMessage)));

        await identityAdminService.UpdatePasswordAsync(currentUserService.UserId, vm.Password, cancellationToken);
    }
}
