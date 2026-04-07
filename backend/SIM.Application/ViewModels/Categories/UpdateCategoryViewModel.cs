namespace SIM.Application.ViewModels.Categories;

public record UpdateCategoryViewModel(
    string Name,
    Guid? ParentId);
