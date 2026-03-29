namespace SIM.Application.Exceptions;

public class BusinessLogicException : Exception
{
    public BusinessLogicException(string message) : base(message) { }
}
