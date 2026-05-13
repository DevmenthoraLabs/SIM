using FluentValidation;
using Microsoft.EntityFrameworkCore;
using SIM.Application.Exceptions;
using SIM.Application.ViewModels.Batches;
using SIM.Domain.Abstractions;
using SIM.Domain.Constants;
using SIM.Domain.Entities;

namespace SIM.Application.Features.Batches;

public class RegisterBatchCommandHandler(
    IValidator<RegisterBatchViewModel> validator,
    IUnitOfWork unitOfWork)
{
    public async Task<BatchViewModel> HandleAsync(
        RegisterBatchViewModel vm,
        CancellationToken cancellationToken = default)
    {
        var validation = await validator.ValidateAsync(vm, cancellationToken);
        if (!validation.IsValid)
            throw new BusinessLogicException(string.Join(" ", validation.Errors.Select(e => e.ErrorMessage)));

        var product = await unitOfWork.Products
            .FirstOrDefaultAsync(p => p.Id == vm.ProductId, cancellationToken);

        if (product is null)
            throw new BusinessLogicException(ValidationMessages.BatchProductNotFound);

        if (!product.RequiresBatchTracking)
            throw new BusinessLogicException(ValidationMessages.BatchProductDoesNotRequireBatchTracking);

        var supplier = await unitOfWork.Suppliers
            .FirstOrDefaultAsync(s => s.Id == vm.SupplierId, cancellationToken);

        if (supplier is null)
            throw new BusinessLogicException(ValidationMessages.BatchSupplierNotFound);

        if (!supplier.IsActive)
            throw new BusinessLogicException(ValidationMessages.BatchSupplierInactive);

        var lotExists = await unitOfWork.Batches
            .AnyAsync(b => b.ProductId == vm.ProductId && b.LotNumber == vm.LotNumber, cancellationToken);

        if (lotExists)
            throw new BusinessLogicException(ValidationMessages.BatchLotNumberAlreadyExists);

        var batch = Batch.Create(
            vm.ProductId,
            vm.SupplierId,
            vm.LotNumber,
            vm.ManufacturingDate,
            vm.ExpiryDate,
            vm.Quantity,
            vm.UnitCost);

        unitOfWork.Batches.Add(batch);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        batch = await unitOfWork.Batches
            .Include(b => b.Product)
            .Include(b => b.Supplier)
            .FirstAsync(b => b.Id == batch.Id, cancellationToken);

        return BatchViewModel.From(batch);
    }
}
