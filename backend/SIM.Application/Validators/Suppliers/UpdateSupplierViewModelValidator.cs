using FluentValidation;
using SIM.Application.ViewModels.Suppliers;
using SIM.Domain.Constants;

namespace SIM.Application.Validators.Suppliers;

public class UpdateSupplierViewModelValidator : AbstractValidator<UpdateSupplierViewModel>
{
    public UpdateSupplierViewModelValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage(ValidationMessages.SupplierNameRequired)
            .MaximumLength(200).WithMessage(ValidationMessages.SupplierNameTooLong);

        RuleFor(x => x.Cnpj)
            .NotEmpty().WithMessage(ValidationMessages.SupplierCnpjRequired)
            .Length(14).WithMessage(ValidationMessages.SupplierCnpjInvalid)
            .Matches("^[0-9]{14}$").WithMessage(ValidationMessages.SupplierCnpjInvalid);

        RuleFor(x => x.Phone)
            .MaximumLength(20).WithMessage(ValidationMessages.SupplierPhoneTooLong);

        RuleFor(x => x.Email)
            .MaximumLength(200).WithMessage(ValidationMessages.SupplierEmailTooLong)
            .EmailAddress().WithMessage(ValidationMessages.SupplierEmailInvalid)
            .When(x => !string.IsNullOrWhiteSpace(x.Email));

        RuleFor(x => x.ContactName)
            .MaximumLength(200).WithMessage(ValidationMessages.SupplierContactNameTooLong);

        RuleFor(x => x.Street)
            .MaximumLength(200).WithMessage(ValidationMessages.SupplierStreetTooLong);

        RuleFor(x => x.City)
            .MaximumLength(100).WithMessage(ValidationMessages.SupplierCityTooLong);

        RuleFor(x => x.State)
            .MaximumLength(50).WithMessage(ValidationMessages.SupplierStateTooLong);

        RuleFor(x => x.ZipCode)
            .MaximumLength(20).WithMessage(ValidationMessages.SupplierZipCodeTooLong);
    }
}
