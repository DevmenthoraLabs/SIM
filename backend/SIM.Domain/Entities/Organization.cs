using SIM.Domain.Abstractions;
using SIM.Domain.Constants;
using SIM.Domain.Enums;
using SIM.Domain.Exceptions;

namespace SIM.Domain.Entities;

public class Organization : BaseEntity
{
    public string Name { get; private set; } = string.Empty;
    public string Cnpj { get; private set; } = string.Empty;
    public OrganizationType Type { get; private set; }

    private Organization() { }

    public static Organization Create(string name, string cnpj, OrganizationType type)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new DomainValidationException(ValidationMessages.OrganizationNameRequired);

        if (string.IsNullOrWhiteSpace(cnpj))
            throw new DomainValidationException(ValidationMessages.CnpjRequired);

        return new Organization
        {
            Name = name.Trim(),
            Cnpj = cnpj.Trim(),
            Type = type
        };
    }
}
