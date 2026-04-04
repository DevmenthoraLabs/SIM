using Microsoft.EntityFrameworkCore;
using SIM.Application.ViewModels.Units;
using SIM.Domain.Abstractions;

namespace SIM.Application.Features.Units;

public class GetAllUnitsQuery(IUnitOfWork unitOfWork)
{
    public async Task<IReadOnlyList<UnitViewModel>> HandleAsync(
        CancellationToken cancellationToken = default)
    {
        return await unitOfWork.Units
            .Select(UnitViewModel.FromEntity)
            .ToListAsync(cancellationToken);
    }
}
