using FluentValidation;
using SIM.Application.ViewModels.Batches;
using SIM.Domain.Constants;

namespace SIM.Application.Validators.Batches;

public class RegisterBatchViewModelValidator : AbstractValidator<RegisterBatchViewModel>
{
    public RegisterBatchViewModelValidator()
    {
        RuleFor(x => x.ProductId)
            .NotEmpty().WithMessage(ValidationMessages.BatchProductRequired);

        RuleFor(x => x.SupplierId)
            .NotEmpty().WithMessage(ValidationMessages.BatchSupplierRequired);

        RuleFor(x => x.LotNumber)
            .NotEmpty().WithMessage(ValidationMessages.BatchLotNumberRequired)
            .MaximumLength(100).WithMessage(ValidationMessages.BatchLotNumberTooLong);

        RuleFor(x => x.ExpiryDate)
            .NotEqual(DateOnly.MinValue).WithMessage(ValidationMessages.BatchExpiryDateRequired);

        RuleFor(x => x.ManufacturingDate)
            .Must((vm, mfgDate) => mfgDate < vm.ExpiryDate)
            .WithMessage(ValidationMessages.BatchManufacturingDateMustBeBeforeExpiry)
            .When(x => x.ManufacturingDate.HasValue);

        RuleFor(x => x.Quantity)
            .GreaterThan(0).WithMessage(ValidationMessages.BatchQuantityMustBePositive);

        RuleFor(x => x.UnitCost)
            .GreaterThanOrEqualTo(0).WithMessage(ValidationMessages.BatchUnitCostCannotBeNegative)
            .When(x => x.UnitCost.HasValue);
    }
}
