using Microsoft.EntityFrameworkCore;
using SIM.Application.ViewModels.Medications;
using SIM.Domain.Abstractions;
using SIM.Domain.Enums;

namespace SIM.Application.Features.Medications;

public class GetMedicationByIdQuery(IUnitOfWork unitOfWork)
{
    public async Task<MedicationViewModel?> HandleAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        return await unitOfWork.Products
            .Where(p => p.Id == id && p.Type == ProductType.Medication)
            .Select(MedicationViewModel.FromEntity)
            .FirstOrDefaultAsync(cancellationToken);
    }
}
