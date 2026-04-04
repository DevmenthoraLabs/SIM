using FluentValidation;
using SIM.Application.ViewModels.Users;
using SIM.Domain.Constants;
using SIM.Domain.Enums;

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

        RuleFor(x => x.UnitIds)
            .NotEmpty()
            .When(x => x.Role is UserRole.Pharmacist or UserRole.StockManager or UserRole.ReceivingOperator)
            .WithMessage(ValidationMessages.UnitRequiredForRole);
    }
}
