namespace SIM.Application.ViewModels.Suppliers;

public record CreateSupplierViewModel(
    string Name,
    string Cnpj,
    string? Phone,
    string? Email,
    string? ContactName,
    string? Street,
    string? City,
    string? State,
    string? ZipCode);
