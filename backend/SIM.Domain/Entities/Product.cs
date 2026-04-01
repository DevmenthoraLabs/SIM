using SIM.Domain.Abstractions;
using SIM.Domain.Constants;
using SIM.Domain.Exceptions;

namespace SIM.Domain.Entities;

public class Product : LifeCycleEntity, IOrganizationScoped
{
    public string Name { get; private set; } = string.Empty;
    public string Description { get; private set; } = string.Empty;
    public Guid OrganizationId { get; private set; }

    private Product() { }

    public static Product Create(string name, string description, Guid organizationId)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new DomainValidationException(ValidationMessages.ProductNameRequired);

        if (organizationId == Guid.Empty)
            throw new DomainValidationException(ValidationMessages.OrganizationRequired);

        return new Product
        {
            Name = name.Trim(),
            Description = description?.Trim() ?? string.Empty,
            OrganizationId = organizationId
        };
    }
}
