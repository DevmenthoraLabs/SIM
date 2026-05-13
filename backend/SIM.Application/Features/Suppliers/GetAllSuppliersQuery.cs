using Microsoft.EntityFrameworkCore;
using SIM.Application.ViewModels.Suppliers;
using SIM.Domain.Abstractions;

namespace SIM.Application.Features.Suppliers;

public class GetAllSuppliersQuery(IUnitOfWork unitOfWork)
{
    public async Task<IReadOnlyList<SupplierViewModel>> HandleAsync(
        CancellationToken cancellationToken = default)
    {
        return await unitOfWork.Suppliers
            .Select(SupplierViewModel.FromEntity)
            .ToListAsync(cancellationToken);
    }
}
