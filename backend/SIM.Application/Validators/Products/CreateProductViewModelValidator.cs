using FluentValidation;
using SIM.Application.ViewModels.Products;
using SIM.Domain.Constants;

namespace SIM.Application.Validators.Products;

public class CreateProductViewModelValidator : AbstractValidator<CreateProductViewModel>
{
    public CreateProductViewModelValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage(ValidationMessages.ProductNameRequired)
            .MaximumLength(200).WithMessage(ValidationMessages.ProductNameTooLong);

        RuleFor(x => x.Description)
            .MaximumLength(1000).WithMessage(ValidationMessages.ProductDescriptionTooLong);

        RuleFor(x => x.BarCode)
            .MaximumLength(50).WithMessage(ValidationMessages.ProductBarCodeTooLong);
    }
}
