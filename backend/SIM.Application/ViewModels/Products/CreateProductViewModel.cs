namespace SIM.Application.ViewModels.Products;

public record CreateProductViewModel(
    string Name,
    string? Description,
    string? BarCode,
    bool RequiresBatchTracking,
    Guid? CategoryId);
