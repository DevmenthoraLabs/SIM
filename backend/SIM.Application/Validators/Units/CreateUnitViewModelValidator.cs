using FluentValidation;
using SIM.Application.ViewModels.Units;
using SIM.Domain.Constants;

namespace SIM.Application.Validators.Units;

public class CreateUnitViewModelValidator : AbstractValidator<CreateUnitViewModel>
{
    public CreateUnitViewModelValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage(ValidationMessages.UnitNameRequired)
            .MaximumLength(200).WithMessage(ValidationMessages.UnitNameTooLong);

        RuleFor(x => x.Code)
            .NotEmpty().WithMessage(ValidationMessages.UnitCodeRequired)
            .MaximumLength(20).WithMessage(ValidationMessages.UnitCodeTooLong);

        RuleFor(x => x.Phone)
            .MaximumLength(20).WithMessage(ValidationMessages.UnitPhoneTooLong);
    }
}
