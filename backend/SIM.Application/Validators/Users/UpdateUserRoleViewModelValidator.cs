using FluentValidation;
using SIM.Application.ViewModels.Users;
using SIM.Domain.Constants;

namespace SIM.Application.Validators.Users;

public class UpdateUserRoleViewModelValidator : AbstractValidator<UpdateUserRoleViewModel>
{
    public UpdateUserRoleViewModelValidator()
    {
        RuleFor(x => x.NewRole)
            .IsInEnum()
            .WithMessage(ValidationMessages.UserRoleInvalid);
    }
}
