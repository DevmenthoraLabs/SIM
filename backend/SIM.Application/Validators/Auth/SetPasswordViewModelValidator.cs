using FluentValidation;
using SIM.Application.ViewModels.Auth;
using SIM.Domain.Constants;

namespace SIM.Application.Validators.Auth;

public class SetPasswordViewModelValidator : AbstractValidator<SetPasswordViewModel>
{
    private static readonly string[] ValidTypes = ["invite", "recovery"];

    public SetPasswordViewModelValidator()
    {
        RuleFor(x => x.TokenHash)
            .NotEmpty().WithMessage(ValidationMessages.TokenHashRequired);

        RuleFor(x => x.Type)
            .Must(t => ValidTypes.Contains(t)).WithMessage(ValidationMessages.TokenTypeInvalid);

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage(ValidationMessages.PasswordRequired)
            .MinimumLength(8).WithMessage(ValidationMessages.PasswordTooShort);
    }
}
