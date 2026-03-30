using FluentValidation;
using SIM.Application.ViewModels.Users;
using SIM.Domain.Constants;

namespace SIM.Application.Validators.Users;

public class InviteUserViewModelValidator : AbstractValidator<InviteUserViewModel>
{
    public InviteUserViewModelValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty().WithMessage(ValidationMessages.EmailRequired)
            .EmailAddress().WithMessage(ValidationMessages.EmailInvalid);

        RuleFor(x => x.FullName)
            .NotEmpty().WithMessage(ValidationMessages.FullNameRequired)
            .MaximumLength(200).WithMessage(ValidationMessages.FullNameTooLong);

        RuleFor(x => x.Role)
            .IsInEnum().WithMessage(ValidationMessages.UserRoleInvalid);

        RuleFor(x => x.OrganizationId)
            .NotEmpty().WithMessage(ValidationMessages.OrganizationRequired);
    }
}
