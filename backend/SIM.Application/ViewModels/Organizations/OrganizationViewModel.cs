using SIM.Domain.Enums;

namespace SIM.Application.ViewModels.Organizations;

public record OrganizationViewModel(
    Guid Id,
    string Name,
    string Cnpj,
    OrganizationType Type,
    DateTime CreatedAt,
    bool IsActive);
