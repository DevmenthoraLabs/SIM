namespace SIM.Domain.Exceptions;

public class DomainValidationException: Exception
{
    public DomainValidationException(string Message) : base(Message) { }
}
