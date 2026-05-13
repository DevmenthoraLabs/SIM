namespace SIM.Application.ViewModels.Batches;

public record RegisterBatchViewModel(
    Guid ProductId,
    Guid SupplierId,
    string LotNumber,
    DateOnly? ManufacturingDate,
    DateOnly ExpiryDate,
    decimal Quantity,
    decimal? UnitCost);
