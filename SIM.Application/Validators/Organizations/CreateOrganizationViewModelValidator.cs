using FluentValidation;
using SIM.Application.ViewModels.Organizations;
using SIM.Domain.Constants;

namespace SIM.Application.Validators.Organizations;

public class CreateOrganizationViewModelValidator : AbstractValidator<CreateOrganizationViewModel>
{
    public CreateOrganizationViewModelValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage(ValidationMessages.OrganizationNameRequired)
            .MaximumLength(200).WithMessage(ValidationMessages.OrganizationNameTooLong);

        RuleFor(x => x.Cnpj)
            .NotEmpty().WithMessage(ValidationMessages.CnpjRequired)
            .Matches(@"^\d{14}$").WithMessage(ValidationMessages.CnpjInvalid);

        RuleFor(x => x.Type)
            .IsInEnum().WithMessage(ValidationMessages.OrganizationTypeInvalid);
    }
}
