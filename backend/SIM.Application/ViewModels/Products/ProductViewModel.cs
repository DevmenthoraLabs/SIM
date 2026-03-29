namespace SIM.Application.ViewModels.Products;

public record ProductViewModel(
    Guid Id,
    string Name,
    string Description,
    DateTime CreatedAt,
    bool IsActive);
