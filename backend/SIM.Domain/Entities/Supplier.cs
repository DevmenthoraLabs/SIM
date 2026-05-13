using SIM.Domain.Abstractions;
using SIM.Domain.Constants;
using SIM.Domain.Exceptions;

namespace SIM.Domain.Entities;

public class Supplier : LifeCycleEntity, IOrganizationScoped
{
    public string Name { get; private set; } = string.Empty;
    public string Cnpj { get; private set; } = string.Empty;
    public string? Phone { get; private set; }
    public string? Email { get; private set; }
    public string? ContactName { get; private set; }
    public string? Street { get; private set; }
    public string? City { get; private set; }
    public string? State { get; private set; }
    public string? ZipCode { get; private set; }
    public Guid OrganizationId { get; private set; }

    private Supplier() { }

    public static Supplier Create(
        string name,
        string cnpj,
        string? phone,
        string? email,
        string? contactName,
        string? street,
        string? city,
        string? state,
        string? zipCode,
        Guid organizationId)
    {
        Validate(name, cnpj, organizationId);

        return new Supplier
        {
            Name = name.Trim(),
            Cnpj = cnpj.Trim(),
            Phone = phone?.Trim(),
            Email = email?.Trim(),
            ContactName = contactName?.Trim(),
            Street = street?.Trim(),
            City = city?.Trim(),
            State = state?.Trim(),
            ZipCode = zipCode?.Trim(),
            OrganizationId = organizationId
        };
    }

    public void Update(
        string name,
        string cnpj,
        string? phone,
        string? email,
        string? contactName,
        string? street,
        string? city,
        string? state,
        string? zipCode)
    {
        Validate(name, cnpj, OrganizationId);

        Name = name.Trim();
        Cnpj = cnpj.Trim();
        Phone = phone?.Trim();
        Email = email?.Trim();
        ContactName = contactName?.Trim();
        Street = street?.Trim();
        City = city?.Trim();
        State = state?.Trim();
        ZipCode = zipCode?.Trim();
        UpdatedAt = DateTime.UtcNow;
    }

    private static void Validate(string name, string cnpj, Guid organizationId)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new DomainValidationException(ValidationMessages.SupplierNameRequired);

        if (name.Length > 200)
            throw new DomainValidationException(ValidationMessages.SupplierNameTooLong);

        if (string.IsNullOrWhiteSpace(cnpj))
            throw new DomainValidationException(ValidationMessages.SupplierCnpjRequired);

        if (cnpj.Length != 14 || !cnpj.All(char.IsDigit))
            throw new DomainValidationException(ValidationMessages.SupplierCnpjInvalid);

        if (organizationId == Guid.Empty)
            throw new DomainValidationException(ValidationMessages.OrganizationRequired);
    }
}
