using SIM.Domain.Abstractions;
using SIM.Domain.Constants;
using SIM.Domain.Exceptions;

namespace SIM.Domain.Entities;

public class Unit : LifeCycleEntity, IOrganizationScoped
{
    public string Name { get; private set; } = string.Empty;
    public string Code { get; private set; } = string.Empty;
    public string? Address { get; private set; }
    public string? Phone { get; private set; }
    public Guid OrganizationId { get; private set; }

    private Unit() { }

    public static Unit Create(
        string name,
        string code,
        string? address,
        string? phone,
        Guid organizationId)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new DomainValidationException(ValidationMessages.UnitNameRequired);

        if (name.Length > 200)
            throw new DomainValidationException(ValidationMessages.UnitNameTooLong);

        if (string.IsNullOrWhiteSpace(code))
            throw new DomainValidationException(ValidationMessages.UnitCodeRequired);

        if (code.Length > 20)
            throw new DomainValidationException(ValidationMessages.UnitCodeTooLong);

        if (organizationId == Guid.Empty)
            throw new DomainValidationException(ValidationMessages.OrganizationRequired);

        if (phone is not null && phone.Length > 20)
            throw new DomainValidationException(ValidationMessages.UnitPhoneTooLong);

        return new Unit
        {
            Name = name.Trim(),
            Code = code.Trim(),
            Address = address?.Trim(),
            Phone = phone?.Trim(),
            OrganizationId = organizationId
        };
    }

    public void Update(string name, string code, string? address, string? phone)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new DomainValidationException(ValidationMessages.UnitNameRequired);

        if (name.Length > 200)
            throw new DomainValidationException(ValidationMessages.UnitNameTooLong);

        if (string.IsNullOrWhiteSpace(code))
            throw new DomainValidationException(ValidationMessages.UnitCodeRequired);

        if (code.Length > 20)
            throw new DomainValidationException(ValidationMessages.UnitCodeTooLong);

        if (phone is not null && phone.Length > 20)
            throw new DomainValidationException(ValidationMessages.UnitPhoneTooLong);

        Name = name.Trim();
        Code = code.Trim();
        Address = address?.Trim();
        Phone = phone?.Trim();
        UpdatedAt = DateTime.UtcNow;
    }
}
