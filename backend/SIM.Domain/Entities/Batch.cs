using SIM.Domain.Abstractions;
using SIM.Domain.Constants;
using SIM.Domain.Exceptions;

namespace SIM.Domain.Entities;

public class Batch : LifeCycleEntity
{
    public Guid ProductId { get; private set; }
    public Guid SupplierId { get; private set; }
    public string LotNumber { get; private set; } = string.Empty;
    public DateOnly? ManufacturingDate { get; private set; }
    public DateOnly ExpiryDate { get; private set; }
    public decimal Quantity { get; private set; }
    public decimal? UnitCost { get; private set; }

    // Navigation
    public Product? Product { get; private set; }
    public Supplier? Supplier { get; private set; }

    private Batch() { }

    public static Batch Create(
        Guid productId,
        Guid supplierId,
        string lotNumber,
        DateOnly? manufacturingDate,
        DateOnly expiryDate,
        decimal quantity,
        decimal? unitCost)
    {
        if (productId == Guid.Empty)
            throw new DomainValidationException(ValidationMessages.BatchProductRequired);

        if (supplierId == Guid.Empty)
            throw new DomainValidationException(ValidationMessages.BatchSupplierRequired);

        if (string.IsNullOrWhiteSpace(lotNumber))
            throw new DomainValidationException(ValidationMessages.BatchLotNumberRequired);

        if (lotNumber.Length > 100)
            throw new DomainValidationException(ValidationMessages.BatchLotNumberTooLong);

        if (manufacturingDate.HasValue && manufacturingDate.Value >= expiryDate)
            throw new DomainValidationException(ValidationMessages.BatchManufacturingDateMustBeBeforeExpiry);

        if (quantity <= 0)
            throw new DomainValidationException(ValidationMessages.BatchQuantityMustBePositive);

        if (unitCost.HasValue && unitCost.Value < 0)
            throw new DomainValidationException(ValidationMessages.BatchUnitCostCannotBeNegative);

        return new Batch
        {
            ProductId = productId,
            SupplierId = supplierId,
            LotNumber = lotNumber.Trim(),
            ManufacturingDate = manufacturingDate,
            ExpiryDate = expiryDate,
            Quantity = quantity,
            UnitCost = unitCost
        };
    }
}
