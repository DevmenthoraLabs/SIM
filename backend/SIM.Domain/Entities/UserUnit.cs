using SIM.Domain.Abstractions;
using SIM.Domain.Constants;
using SIM.Domain.Exceptions;

namespace SIM.Domain.Entities;

public class UserUnit : LifeCycleEntity, IOrganizationScoped
{
    public Guid UserId { get; private set; }
    public Guid UnitId { get; private set; }
    public Guid OrganizationId { get; private set; }

    // Navigation
    public UserProfile? User { get; private set; }
    public Unit? Unit { get; private set; }

    private UserUnit() { }

    public static UserUnit Create(Guid userId, Guid unitId, Guid organizationId)
    {
        if (userId == Guid.Empty)
            throw new DomainValidationException(ValidationMessages.UserIdRequired);

        if (unitId == Guid.Empty)
            throw new DomainValidationException(ValidationMessages.UnitIdRequired);

        if (organizationId == Guid.Empty)
            throw new DomainValidationException(ValidationMessages.OrganizationRequired);

        return new UserUnit
        {
            UserId = userId,
            UnitId = unitId,
            OrganizationId = organizationId
        };
    }
}
