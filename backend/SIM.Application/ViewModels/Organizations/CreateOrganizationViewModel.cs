using SIM.Domain.Enums;

namespace SIM.Application.ViewModels.Organizations;

public record CreateOrganizationViewModel(
    string Name,
    string Cnpj,
    OrganizationType Type);
