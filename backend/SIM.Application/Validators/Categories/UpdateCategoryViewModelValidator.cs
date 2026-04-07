using FluentValidation;
using SIM.Application.ViewModels.Categories;
using SIM.Domain.Constants;

namespace SIM.Application.Validators.Categories;

public class UpdateCategoryViewModelValidator : AbstractValidator<UpdateCategoryViewModel>
{
    public UpdateCategoryViewModelValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage(ValidationMessages.CategoryNameRequired)
            .MaximumLength(100).WithMessage(ValidationMessages.CategoryNameTooLong);
    }
}
