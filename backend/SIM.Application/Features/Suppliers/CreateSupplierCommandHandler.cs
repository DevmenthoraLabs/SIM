using FluentValidation;
using Microsoft.EntityFrameworkCore;
using SIM.Application.Abstractions;
using SIM.Application.Exceptions;
using SIM.Application.ViewModels.Suppliers;
using SIM.Domain.Abstractions;
using SIM.Domain.Constants;
using SIM.Domain.Entities;

namespace SIM.Application.Features.Suppliers;

public class CreateSupplierCommandHandler(
    IValidator<CreateSupplierViewModel> validator,
    IUnitOfWork unitOfWork,
    ICurrentUserService currentUserService)
{
    public async Task<SupplierViewModel> HandleAsync(
        CreateSupplierViewModel vm,
        CancellationToken cancellationToken = default)
    {
        var validation = await validator.ValidateAsync(vm, cancellationToken);
        if (!validation.IsValid)
            throw new BusinessLogicException(string.Join(" ", validation.Errors.Select(e => e.ErrorMessage)));

        var organizationId = currentUserService.OrganizationId!.Value;

        var cnpjExists = await unitOfWork.Suppliers
            .AnyAsync(s => s.Cnpj == vm.Cnpj && s.OrganizationId == organizationId, cancellationToken);

        if (cnpjExists)
            throw new BusinessLogicException(ValidationMessages.SupplierCnpjAlreadyExists);

        var supplier = Supplier.Create(
            vm.Name,
            vm.Cnpj,
            vm.Phone,
            vm.Email,
            vm.ContactName,
            vm.Street,
            vm.City,
            vm.State,
            vm.ZipCode,
            organizationId);

        unitOfWork.Suppliers.Add(supplier);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return SupplierViewModel.From(supplier);
    }
}
