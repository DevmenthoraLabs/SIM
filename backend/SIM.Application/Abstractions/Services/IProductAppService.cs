using SIM.Application.ViewModels.Products;

namespace SIM.Application.Abstractions.Services;

public interface IProductAppService
{
    Task<ProductViewModel> CreateAsync(CreateProductViewModel vm, CancellationToken cancellationToken = default);
    Task<ProductViewModel?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<ProductViewModel>> GetAllAsync(CancellationToken cancellationToken = default);
}
