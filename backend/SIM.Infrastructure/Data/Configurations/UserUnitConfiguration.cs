using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SIM.Domain.Entities;

namespace SIM.Infrastructure.Data.Configurations;

public class UserUnitConfiguration : IEntityTypeConfiguration<UserUnit>
{
    public void Configure(EntityTypeBuilder<UserUnit> builder)
    {
        builder.ToTable("user_units");

        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).ValueGeneratedNever();

        builder.Property(x => x.UserId).IsRequired();
        builder.Property(x => x.UnitId).IsRequired();
        builder.Property(x => x.OrganizationId).IsRequired();
        builder.Property(x => x.CreatedAt).IsRequired();
        builder.Property(x => x.IsActive).IsRequired();

        // Partial unique index: only one active assignment per (UserId, UnitId)
        // Historical inactive records are kept for audit trail
        builder.HasIndex(x => new { x.UserId, x.UnitId })
            .IsUnique()
            .HasFilter("IsActive = true");

        builder.HasOne(x => x.User)
            .WithMany()
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Unit)
            .WithMany()
            .HasForeignKey(x => x.UnitId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne<Organization>()
            .WithMany()
            .HasForeignKey(x => x.OrganizationId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
