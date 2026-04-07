namespace SIM.Application.ViewModels.Units;

public record UpdateUnitViewModel(
    string Name,
    string Code,
    string? Address,
    string? Phone);
