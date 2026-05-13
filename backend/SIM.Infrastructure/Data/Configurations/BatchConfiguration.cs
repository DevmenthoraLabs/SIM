using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SIM.Domain.Entities;

namespace SIM.Infrastructure.Data.Configurations;

public class BatchConfiguration : IEntityTypeConfiguration<Batch>
{
    public void Configure(EntityTypeBuilder<Batch> builder)
    {
        builder.ToTable("batches");

        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).ValueGeneratedNever();

        builder.Property(x => x.LotNumber)
            .IsRequired()
            .HasMaxLength(100);

        builder.HasIndex(x => new { x.ProductId, x.LotNumber })
            .IsUnique();

        builder.Property(x => x.ManufacturingDate);
        builder.Property(x => x.ExpiryDate).IsRequired();

        builder.Property(x => x.Quantity)
            .IsRequired()
            .HasPrecision(18, 4);

        builder.Property(x => x.UnitCost)
            .HasPrecision(18, 4);

        builder.Property(x => x.ProductId).IsRequired();
        builder.HasIndex(x => x.ProductId);
        builder.HasOne(x => x.Product)
            .WithMany()
            .HasForeignKey(x => x.ProductId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Property(x => x.SupplierId).IsRequired();
        builder.HasIndex(x => x.SupplierId);
        builder.HasOne(x => x.Supplier)
            .WithMany()
            .HasForeignKey(x => x.SupplierId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Property(x => x.CreatedAt).IsRequired();
        builder.Property(x => x.IsActive).IsRequired();
    }
}
