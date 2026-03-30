using Microsoft.EntityFrameworkCore;
using SIM.Application.Abstractions;
using SIM.Domain.Abstractions;
using SIM.Domain.Entities;
using System.Reflection;

namespace SIM.Infrastructure.Data;

public class ApplicationDbContext(
    DbContextOptions<ApplicationDbContext> options,
    ICurrentUserService currentUserService) : DbContext(options)
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
    /// </summary>
    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        if (!currentUserService.IsSuperAdmin)
            EnforceOrganizationScope();

        return await base.SaveChangesAsync(cancellationToken);
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
