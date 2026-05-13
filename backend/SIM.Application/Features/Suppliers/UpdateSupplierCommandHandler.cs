using FluentValidation;
using Microsoft.EntityFrameworkCore;
using SIM.Application.Exceptions;
using SIM.Application.ViewModels.Suppliers;
using SIM.Domain.Abstractions;
using SIM.Domain.Constants;

namespace SIM.Application.Features.Suppliers;

public class UpdateSupplierCommandHandler(
    IValidator<UpdateSupplierViewModel> validator,
    IUnitOfWork unitOfWork)
{
    public async Task<SupplierViewModel> HandleAsync(
        Guid id,
        UpdateSupplierViewModel vm,
        CancellationToken cancellationToken = default)
    {
        var validation = await validator.ValidateAsync(vm, cancellationToken);
        if (!validation.IsValid)
            throw new BusinessLogicException(string.Join(" ", validation.Errors.Select(e => e.ErrorMessage)));

        var supplier = await unitOfWork.Suppliers
            .FirstOrDefaultAsync(s => s.Id == id, cancellationToken);

        if (supplier is null)
            throw new BusinessLogicException(ValidationMessages.SupplierNotFound);

        if (!supplier.IsActive)
            throw new BusinessLogicException(ValidationMessages.SupplierInactive);

        var cnpjTakenByAnother = await unitOfWork.Suppliers
            .AnyAsync(s => s.Cnpj == vm.Cnpj && s.Id != id, cancellationToken);

        if (cnpjTakenByAnother)
            throw new BusinessLogicException(ValidationMessages.SupplierCnpjAlreadyExists);

        supplier.Update(
            vm.Name,
            vm.Cnpj,
            vm.Phone,
            vm.Email,
            vm.ContactName,
            vm.Street,
            vm.City,
            vm.State,
            vm.ZipCode);

        await unitOfWork.SaveChangesAsync(cancellationToken);

        return SupplierViewModel.From(supplier);
    }
}
