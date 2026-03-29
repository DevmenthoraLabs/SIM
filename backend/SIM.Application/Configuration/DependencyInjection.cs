using FluentValidation;
using Microsoft.Extensions.DependencyInjection;
using System.Reflection;

namespace SIM.Application.Configuration;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        var assembly = Assembly.GetExecutingAssembly();

        services.AddValidatorsFromAssembly(assembly);

        var serviceTypes = assembly.GetTypes()
            .Where(t => t.Name.EndsWith("Service") && !t.IsInterface && !t.IsAbstract);

        foreach (var implementationType in serviceTypes)
        {
            var interfaceType = assembly.GetTypes()
                .FirstOrDefault(t => t.IsInterface && t.Name == $"I{implementationType.Name}");

            if (interfaceType != null)
                services.AddScoped(interfaceType, implementationType);
            else
                services.AddScoped(implementationType);
        }

        return services;
    }
}
