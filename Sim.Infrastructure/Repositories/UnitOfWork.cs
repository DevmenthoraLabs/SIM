using SIM.Domain.Abstractions;

namespace SIM.Infrastructure.Repositories;

public class UnitOfWork : IUnitOfWork
{
    //private readonly SystemDbContext _context;

    public UnitOfWork(
        //SystemDbContext context,
        //IUserRepository Users)
    )
    {
        //_context = context;
        //Users = Users;
    }

    //public async Task<bool> CommitAsync() => await _context.SaveChangesAsync() > 0;
    public void Dispose()
    {
        return;
    }
}
