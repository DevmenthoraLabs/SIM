using SIM.Domain.Abstractions;
using SIM.Domain.Constants;
using SIM.Domain.Enums;
using SIM.Domain.Exceptions;

namespace SIM.Domain.Entities;

public class Product : LifeCycleEntity, IOrganizationScoped
{
    public string Name { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public ProductType Type { get; private set; }
    public string? BarCode { get; private set; }
    public bool RequiresBatchTracking { get; private set; }
    public Guid? CategoryId { get; private set; }
    public Guid OrganizationId { get; private set; }

    // Navigation
    public Category? Category { get; private set; }
    public MedicationDetails? MedicationDetails { get; private set; }

    private Product() { }

    /// <summary>
    /// Creates a Generic product. For Medication, use <see cref="CreateMedication"/>.
    /// </summary>
    public static Product CreateGeneric(
        string name,
        string? description,
        string? barCode,
        bool requiresBatchTracking,
        Guid? categoryId,
        Guid organizationId)
    {
        Validate(name, organizationId);

        return new Product
        {
            Name = name.Trim(),
            Description = description?.Trim(),
            Type = ProductType.Generic,
            BarCode = barCode?.Trim(),
            RequiresBatchTracking = requiresBatchTracking,
            CategoryId = categoryId,
            OrganizationId = organizationId
        };
    }

    /// <summary>
    /// Creates a Medication product with its satellite details as a single atomic unit.
    /// RequiresBatchTracking is always true for medications.
    /// </summary>
    public static Product CreateMedication(
        string name,
        string? description,
        string? barCode,
        Guid? categoryId,
        Guid organizationId,
        string? genericName,
        string? activeIngredient,
        string? presentation,
        string? concentration,
        bool isControlled)
    {
        Validate(name, organizationId);

        var product = new Product
        {
            Name = name.Trim(),
            Description = description?.Trim(),
            Type = ProductType.Medication,
            BarCode = barCode?.Trim(),
            RequiresBatchTracking = true,
            CategoryId = categoryId,
            OrganizationId = organizationId
        };

        product.MedicationDetails = MedicationDetails.Create(
            product.Id, genericName, activeIngredient, presentation, concentration, isControlled);

        return product;
    }

    public void Update(string name, string? description, string? barCode, Guid? categoryId)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new DomainValidationException(ValidationMessages.ProductNameRequired);

        Name = name.Trim();
        Description = description?.Trim();
        BarCode = barCode?.Trim();
        CategoryId = categoryId;
        UpdatedAt = DateTime.UtcNow;
    }

    /// <summary>
    /// Updates the satellite MedicationDetails. Only valid when Type == Medication.
    /// </summary>
    public void UpdateMedicationDetails(
        string? genericName,
        string? activeIngredient,
        string? presentation,
        string? concentration,
        bool isControlled)
    {
        MedicationDetails!.Update(genericName, activeIngredient, presentation, concentration, isControlled);
        UpdatedAt = DateTime.UtcNow;
    }

    /// <summary>
    /// Enables batch tracking for this product. Once enabled, it can never be disabled.
    /// </summary>
    public void EnableBatchTracking()
    {
        if (RequiresBatchTracking) return;
        RequiresBatchTracking = true;
        UpdatedAt = DateTime.UtcNow;
    }

    private static void Validate(string name, Guid organizationId)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new DomainValidationException(ValidationMessages.ProductNameRequired);

        if (organizationId == Guid.Empty)
            throw new DomainValidationException(ValidationMessages.OrganizationRequired);
    }
}
