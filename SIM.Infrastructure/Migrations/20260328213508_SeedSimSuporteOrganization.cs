using Microsoft.EntityFrameworkCore.Migrations;
using SIM.Domain.Constants;

#nullable disable

namespace SIM.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class SeedSimSuporteOrganization : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Seeds the internal SIM support organization with a fixed, well-known UUID.
            // All SuperAdmin users belong to this organization.
            // ON CONFLICT DO NOTHING makes this idempotent (safe to re-run).
            migrationBuilder.Sql($"""
                INSERT INTO organizations ("Id", "Name", "Cnpj", "Type", "CreatedAt", "UpdatedAt", "IsActive")
                VALUES (
                    '{SystemOrganizations.SimSuporte}',
                    'SIM Suporte',
                    '00000000000000',
                    'Private',
                    NOW(),
                    NULL,
                    true
                )
                ON CONFLICT ("Id") DO NOTHING;
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql($"""
                DELETE FROM organizations WHERE "Id" = '{SystemOrganizations.SimSuporte}';
                """);
        }
    }
}
