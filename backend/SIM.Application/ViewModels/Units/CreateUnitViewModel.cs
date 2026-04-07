namespace SIM.Application.ViewModels.Units;

public record CreateUnitViewModel(
    string Name,
    string Code,
    string? Address,
    string? Phone);
