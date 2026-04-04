using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SIM.Domain.Entities;

namespace SIM.Infrastructure.Data.Configurations;

public class MedicationDetailsConfiguration : IEntityTypeConfiguration<MedicationDetails>
{
    public void Configure(EntityTypeBuilder<MedicationDetails> builder)
    {
        builder.ToTable("medication_details");

        builder.HasKey(x => x.ProductId);

        builder.Property(x => x.GenericName).HasMaxLength(300);
        builder.Property(x => x.ActiveIngredient).HasMaxLength(300);
        builder.Property(x => x.Presentation).HasMaxLength(100);
        builder.Property(x => x.Concentration).HasMaxLength(50);
        builder.Property(x => x.IsControlled).IsRequired();
    }
}
