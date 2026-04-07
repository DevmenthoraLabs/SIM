using FluentValidation;
using SIM.Application.ViewModels.Categories;
using SIM.Domain.Constants;

namespace SIM.Application.Validators.Categories;

public class CreateCategoryViewModelValidator : AbstractValidator<CreateCategoryViewModel>
{
    public CreateCategoryViewModelValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage(ValidationMessages.CategoryNameRequired)
            .MaximumLength(100).WithMessage(ValidationMessages.CategoryNameTooLong);
    }
}
