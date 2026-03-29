using SIM.Domain.Enums;

namespace SIM.Application.ViewModels.Users;

public record CreateUserViewModel(
    Guid SupabaseUserId,
    string FullName,
    string Email,
    UserRole Role,
    Guid OrganizationId,
    Guid? UnitId);
