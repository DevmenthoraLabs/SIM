using SIM.Domain.Abstractions;
using SIM.Domain.Constants;
using SIM.Domain.Exceptions;

namespace SIM.Domain.Entities;

public class Product : BaseEntity
{
    public string Name { get; private set; } = string.Empty;
    public string Description { get; private set; } = string.Empty;

    private Product() { }

    public static Product Create(string name, string description)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new DomainValidationException(ValidationMessages.ProductNameRequired);

        return new Product
        {
            Name = name.Trim(),
            Description = description?.Trim() ?? string.Empty
        };
    }
}
