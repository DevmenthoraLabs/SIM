using FluentValidation;
using SIM.Application.Abstractions;
using SIM.Application.Exceptions;
using SIM.Application.ViewModels.Products;
using SIM.Domain.Abstractions;
using SIM.Domain.Entities;

namespace SIM.Application.Features.Products;

public class CreateProductCommandHandler(
    IValidator<CreateProductViewModel> validator,
    IUnitOfWork unitOfWork,
    ICurrentUserService currentUserService)
{
    public async Task<ProductViewModel> HandleAsync(
        CreateProductViewModel vm,
        CancellationToken cancellationToken = default)
    {
        var validation = await validator.ValidateAsync(vm, cancellationToken);
        if (!validation.IsValid)
            throw new BusinessLogicException(string.Join(" ", validation.Errors.Select(e => e.ErrorMessage)));

        var product = Product.CreateGeneric(
            vm.Name,
            vm.Description,
            vm.BarCode,
            vm.RequiresBatchTracking,
            vm.CategoryId,
            currentUserService.OrganizationId!.Value);

        unitOfWork.Products.Add(product);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ProductViewModel.From(product);
    }
}
