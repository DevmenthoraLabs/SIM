using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using SIM.Application.Exceptions;
using SIM.Domain.Exceptions;

namespace SIM.WebApi.Exceptions;

public class GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        var (statusCode, title) = exception switch
        {
            NotFoundException        => (StatusCodes.Status404NotFound,              "Not Found"),
            ConflictException        => (StatusCodes.Status409Conflict,              "Conflict"),
            BusinessLogicException   => (StatusCodes.Status400BadRequest,            "Bad Request"),
            DomainValidationException => (StatusCodes.Status422UnprocessableEntity,  "Validation Error"),
            _                        => (StatusCodes.Status500InternalServerError,   "Internal Server Error")
        };

        if (statusCode == StatusCodes.Status500InternalServerError)
            logger.LogError(exception, "Unhandled exception: {Message}", exception.Message);

        var problem = new ProblemDetails
        {
            Status = statusCode,
            Title  = title,
            // Never expose internal exception details to the client on 500s.
            Detail = statusCode == StatusCodes.Status500InternalServerError
                ? "An unexpected error occurred. Please try again later."
                : exception.Message
        };

        httpContext.Response.StatusCode = statusCode;
        await httpContext.Response.WriteAsJsonAsync(problem, cancellationToken);
        return true;
    }
}
