using SIM.Domain.Enums;

namespace SIM.Application.ViewModels.Users;

public record InviteUserViewModel(
    string Email,
    string FullName,
    UserRole Role,
    Guid OrganizationId,
    Guid? UnitId);
