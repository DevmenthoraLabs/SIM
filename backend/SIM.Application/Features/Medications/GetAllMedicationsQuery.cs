using Microsoft.EntityFrameworkCore;
using SIM.Application.ViewModels.Medications;
using SIM.Domain.Abstractions;
using SIM.Domain.Enums;

namespace SIM.Application.Features.Medications;

public class GetAllMedicationsQuery(IUnitOfWork unitOfWork)
{
    public async Task<IReadOnlyList<MedicationViewModel>> HandleAsync(
        CancellationToken cancellationToken = default)
    {
        return await unitOfWork.Products
            .Where(p => p.Type == ProductType.Medication)
            .Select(MedicationViewModel.FromEntity)
            .ToListAsync(cancellationToken);
    }
}
