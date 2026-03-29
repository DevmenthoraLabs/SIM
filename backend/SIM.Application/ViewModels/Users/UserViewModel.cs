using SIM.Domain.Enums;

namespace SIM.Application.ViewModels.Users;

public record UserViewModel(
    Guid Id,
    string FullName,
    string Email,
    UserRole Role,
    Guid OrganizationId,
    Guid? UnitId,
    DateTime CreatedAt,
    bool IsActive);
