using Microsoft.EntityFrameworkCore;
using SIM.Application.ViewModels.Suppliers;
using SIM.Domain.Abstractions;

namespace SIM.Application.Features.Suppliers;

public class GetSupplierByIdQuery(IUnitOfWork unitOfWork)
{
    public async Task<SupplierViewModel?> HandleAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        return await unitOfWork.Suppliers
            .Where(s => s.Id == id)
            .Select(SupplierViewModel.FromEntity)
            .FirstOrDefaultAsync(cancellationToken);
    }
}
