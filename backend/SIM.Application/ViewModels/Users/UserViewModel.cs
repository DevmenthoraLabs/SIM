using SIM.Domain.Enums;

namespace SIM.Application.ViewModels.Users;

public record UserViewModel(
    Guid Id,
    string FullName,
    string Email,
    UserRole Role,
    Guid OrganizationId,
    IReadOnlyList<Guid> UnitIds,
    DateTime CreatedAt,
    bool IsActive);
