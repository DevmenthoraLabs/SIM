using FluentValidation;
using Microsoft.Extensions.DependencyInjection;
using SIM.Domain.Abstractions;

namespace SIM.Application.Configuration;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        var assembly = typeof(DependencyInjection).Assembly;

        services.AddValidatorsFromAssembly(assembly);

        // CommandHandlers — scanned by *CommandHandler suffix
        services.Scan(scan => scan
            .FromAssemblies(assembly)
            .AddClasses(x => x.Where(type => type.Name.EndsWith("CommandHandler")))
            .AsSelf()
            .WithScopedLifetime());

        // Queries — scanned by *Query suffix
        services.Scan(scan => scan
            .FromAssemblies(assembly)
            .AddClasses(x => x.Where(type => type.Name.EndsWith("Query")))
            .AsSelf()
            .WithScopedLifetime());

        // Domain Event Handlers — auto-registered via IDomainEventHandler<T>
        services.Scan(scan => scan
            .FromAssemblies(assembly)
            .AddClasses(x => x.AssignableTo(typeof(IDomainEventHandler<>)))
            .AsImplementedInterfaces()
            .WithScopedLifetime());

        return services;
    }
}
