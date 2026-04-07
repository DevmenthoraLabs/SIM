namespace SIM.Domain.Abstractions;

public interface IDomainEvent
{
    DateTime OccurredAt { get; }
}
