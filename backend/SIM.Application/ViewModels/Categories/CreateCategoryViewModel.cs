namespace SIM.Application.ViewModels.Categories;

public record CreateCategoryViewModel(
    string Name,
    Guid? ParentId);
