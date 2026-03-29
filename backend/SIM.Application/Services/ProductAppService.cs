using FluentValidation;
using SIM.Application.Abstractions.Services;
using SIM.Application.Exceptions;
using SIM.Application.ViewModels.Products;
using SIM.Domain.Abstractions;
using SIM.Domain.Entities;

namespace SIM.Application.Services;

public class ProductAppService(
    IValidator<CreateProductViewModel> createValidator,
    IRepository<Product> repository,
    IUnitOfWork unitOfWork) : IProductAppService
{
    public async Task<ProductViewModel> CreateAsync(
        CreateProductViewModel vm,
        CancellationToken cancellationToken = default)
    {
        var validation = await createValidator.ValidateAsync(vm, cancellationToken);
        if (!validation.IsValid)
            throw new BusinessLogicException(string.Join(" ", validation.Errors.Select(e => e.ErrorMessage)));

        var product = Product.Create(vm.Name, vm.Description);

        await repository.AddAsync(product, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return MapToViewModel(product);
    }

    public async Task<ProductViewModel?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var product = await repository.GetByIdAsync(id, cancellationToken);
        return product is null ? null : MapToViewModel(product);
    }

    public async Task<IReadOnlyList<ProductViewModel>> GetAllAsync(
        CancellationToken cancellationToken = default)
    {
        var products = await repository.GetAllAsync(cancellationToken);
        return products.Select(MapToViewModel).ToList();
    }

    private static ProductViewModel MapToViewModel(Product p) =>
        new(p.Id, p.Name, p.Description, p.CreatedAt, p.IsActive);
}
