using Microsoft.EntityFrameworkCore;
using SIM.Domain.Entities;

namespace SIM.Domain.Abstractions;

public interface IUnitOfWork
{
    DbSet<Organization> Organizations { get; }
    DbSet<UserProfile> UserProfiles { get; }
    DbSet<Product> Products { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Executes a raw SQL query via Dapper and returns a single result or null.
    /// Use for complex queries where EF Core projections are insufficient.
    /// </summary>
    Task<T?> QueryFirstOrDefaultAsync<T>(string sql, object? parameters = null, CancellationToken cancellationToken = default);

    /// <summary>
    /// Executes a raw SQL query via Dapper and returns a collection of results.
    /// Use for complex queries where EF Core projections are insufficient.
    /// </summary>
    Task<IEnumerable<T>> QueryAsync<T>(string sql, object? parameters = null, CancellationToken cancellationToken = default);
}
