using SIM.Domain.Abstractions;
using SIM.Domain.Constants;
using SIM.Domain.Exceptions;

namespace SIM.Domain.Entities;

public class Category : LifeCycleEntity, IOrganizationScoped
{
    public string Name { get; private set; } = string.Empty;
    public Guid? ParentId { get; private set; }
    public Guid OrganizationId { get; private set; }

    // Navigation
    public Category? Parent { get; private set; }

    private Category() { }

    public static Category Create(
        string name,
        Guid? parentId,
        Guid organizationId)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new DomainValidationException(ValidationMessages.CategoryNameRequired);

        if (name.Length > 100)
            throw new DomainValidationException(ValidationMessages.CategoryNameTooLong);

        if (organizationId == Guid.Empty)
            throw new DomainValidationException(ValidationMessages.OrganizationRequired);

        return new Category
        {
            Name = name.Trim(),
            ParentId = parentId,
            OrganizationId = organizationId
        };
    }

    public void Update(string name, Guid? parentId)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new DomainValidationException(ValidationMessages.CategoryNameRequired);

        if (name.Length > 100)
            throw new DomainValidationException(ValidationMessages.CategoryNameTooLong);

        Name = name.Trim();
        ParentId = parentId;
        UpdatedAt = DateTime.UtcNow;
    }
}
