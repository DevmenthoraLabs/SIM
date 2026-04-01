using Dapper;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using SIM.Application.Abstractions;
using SIM.Domain.Abstractions;
using SIM.Domain.Entities;
using System.Reflection;

namespace SIM.Infrastructure.Data;

public class ApplicationDbContext(
    DbContextOptions<ApplicationDbContext> options,
    ICurrentUserService currentUserService,
    IServiceProvider serviceProvider) : DbContext(options), IUnitOfWork
{
    public DbSet<Organization> Organizations => Set<Organization>();
    public DbSet<UserProfile> UserProfiles => Set<UserProfile>();
    public DbSet<Product> Products => Set<Product>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);
        ApplyOrganizationScopedFilters(modelBuilder);
    }

    /// <summary>
    /// Registers a global query filter for every entity implementing IOrganizationScoped.
    /// Filters are bypassed automatically for SuperAdmin users.
    /// To intentionally bypass (e.g. cross-org admin operations), call .IgnoreQueryFilters().
    /// </summary>
    private void ApplyOrganizationScopedFilters(ModelBuilder modelBuilder)
    {
        var scopedEntityTypes = modelBuilder.Model
            .GetEntityTypes()
            .Where(e => typeof(IOrganizationScoped).IsAssignableFrom(e.ClrType));

        foreach (var entityType in scopedEntityTypes)
        {
            typeof(ApplicationDbContext)
                .GetMethod(nameof(ConfigureOrgFilter), BindingFlags.NonPublic | BindingFlags.Instance)!
                .MakeGenericMethod(entityType.ClrType)
                .Invoke(this, [modelBuilder]);
        }
    }

    private void ConfigureOrgFilter<T>(ModelBuilder modelBuilder) where T : class, IOrganizationScoped
    {
        modelBuilder.Entity<T>().HasQueryFilter(e =>
            currentUserService.IsSuperAdmin ||
            e.OrganizationId == currentUserService.OrganizationId);
    }

    /// <summary>
    /// Guards every write operation involving IOrganizationScoped entities.
    /// Prevents any careless service from persisting data under the wrong organization.
    /// SuperAdmin operations bypass this check intentionally.
    /// Both sync and async overrides are guarded to prevent accidental bypass.
    /// </summary>
    public override int SaveChanges(bool acceptAllChangesOnSuccess)
    {
        if (!currentUserService.IsSuperAdmin)
            EnforceOrganizationScope();

        return base.SaveChanges(acceptAllChangesOnSuccess);
    }

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        if (!currentUserService.IsSuperAdmin)
            EnforceOrganizationScope();

        var events = ChangeTracker.Entries<BaseEntity>()
            .SelectMany(e => e.Entity.DomainEvents)
            .ToList();

        ChangeTracker.Entries<BaseEntity>()
            .ToList()
            .ForEach(e => e.Entity.ClearDomainEvents());

        var result = await base.SaveChangesAsync(cancellationToken);

        await DispatchDomainEventsAsync(events, cancellationToken);

        return result;
    }

    private async Task DispatchDomainEventsAsync(
        List<IDomainEvent> events,
        CancellationToken cancellationToken)
    {
        foreach (var domainEvent in events)
        {
            var handlerType = typeof(IDomainEventHandler<>).MakeGenericType(domainEvent.GetType());
            var handlers = serviceProvider.GetServices(handlerType);

            foreach (var handler in handlers)
            {
                var method = handlerType.GetMethod(nameof(IDomainEventHandler<IDomainEvent>.HandleAsync))!;
                await (Task)method.Invoke(handler, [domainEvent, cancellationToken])!;
            }
        }
    }

    /// <remarks>
    /// Dapper queries bypass EF Core global query filters.
    /// You MUST include an OrganizationId WHERE clause manually for IOrganizationScoped data.
    /// </remarks>
    public async Task<T?> QueryFirstOrDefaultAsync<T>(
        string sql,
        object? parameters = null,
        CancellationToken cancellationToken = default)
    {
        var connection = Database.GetDbConnection();
        var command = new CommandDefinition(sql, parameters, cancellationToken: cancellationToken);
        return await connection.QueryFirstOrDefaultAsync<T>(command);
    }

    /// <inheritdoc cref="QueryFirstOrDefaultAsync{T}"/>
    public async Task<IEnumerable<T>> QueryAsync<T>(
        string sql,
        object? parameters = null,
        CancellationToken cancellationToken = default)
    {
        var connection = Database.GetDbConnection();
        var command = new CommandDefinition(sql, parameters, cancellationToken: cancellationToken);
        return await connection.QueryAsync<T>(command);
    }

    private void EnforceOrganizationScope()
    {
        var orgId = currentUserService.OrganizationId;

        var violations = ChangeTracker
            .Entries<IOrganizationScoped>()
            .Where(e => e.State is EntityState.Added or EntityState.Modified)
            .Where(e => e.Entity.OrganizationId != orgId)
            .Select(e => e.Entity.GetType().Name)
            .ToList();

        if (violations.Count > 0)
            throw new InvalidOperationException(
                $"Organization scope violation: {string.Join(", ", violations)}. " +
                $"Entities must belong to organization {orgId}.");
    }
}
