using FluentValidation;
using SIM.Application.ViewModels.Medications;
using SIM.Domain.Constants;

namespace SIM.Application.Validators.Medications;

public class CreateMedicationViewModelValidator : AbstractValidator<CreateMedicationViewModel>
{
    public CreateMedicationViewModelValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage(ValidationMessages.ProductNameRequired)
            .MaximumLength(200).WithMessage(ValidationMessages.ProductNameTooLong);

        RuleFor(x => x.Description)
            .MaximumLength(1000).WithMessage(ValidationMessages.ProductDescriptionTooLong);

        RuleFor(x => x.BarCode)
            .MaximumLength(50).WithMessage(ValidationMessages.ProductBarCodeTooLong);

        RuleFor(x => x.GenericName)
            .MaximumLength(300).WithMessage(ValidationMessages.MedicationGenericNameTooLong);

        RuleFor(x => x.ActiveIngredient)
            .MaximumLength(300).WithMessage(ValidationMessages.MedicationActiveIngredientTooLong);

        RuleFor(x => x.Presentation)
            .MaximumLength(100).WithMessage(ValidationMessages.MedicationPresentationTooLong);

        RuleFor(x => x.Concentration)
            .MaximumLength(50).WithMessage(ValidationMessages.MedicationConcentrationTooLong);
    }
}
