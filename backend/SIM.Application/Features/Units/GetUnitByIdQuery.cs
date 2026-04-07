using Microsoft.EntityFrameworkCore;
using SIM.Application.ViewModels.Units;
using SIM.Domain.Abstractions;

namespace SIM.Application.Features.Units;

public class GetUnitByIdQuery(IUnitOfWork unitOfWork)
{
    public async Task<UnitViewModel?> HandleAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        return await unitOfWork.Units
            .Where(u => u.Id == id)
            .Select(UnitViewModel.FromEntity)
            .FirstOrDefaultAsync(cancellationToken);
    }
}
