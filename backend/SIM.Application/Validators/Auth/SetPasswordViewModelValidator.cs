using FluentValidation;
using SIM.Application.ViewModels.Auth;
using SIM.Domain.Constants;

namespace SIM.Application.Validators.Auth;

public class SetPasswordViewModelValidator : AbstractValidator<SetPasswordViewModel>
{
    public SetPasswordViewModelValidator()
    {
        RuleFor(x => x.Password)
            .NotEmpty().WithMessage(ValidationMessages.PasswordRequired)
            .MinimumLength(8).WithMessage(ValidationMessages.PasswordTooShort);
    }
}
