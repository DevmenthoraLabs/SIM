using FluentValidation;
using SIM.Application.ViewModels.Auth;
using SIM.Domain.Constants;

namespace SIM.Application.Validators.Auth;

public class RefreshViewModelValidator : AbstractValidator<RefreshViewModel>
{
    public RefreshViewModelValidator()
    {
        RuleFor(x => x.RefreshToken)
            .NotEmpty().WithMessage(ValidationMessages.RefreshTokenRequired);
    }
}
