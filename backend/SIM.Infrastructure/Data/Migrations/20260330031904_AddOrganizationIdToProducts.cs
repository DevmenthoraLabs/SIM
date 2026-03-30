using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SIM.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddOrganizationIdToProducts : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "OrganizationId",
                table: "products",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateIndex(
                name: "IX_products_OrganizationId",
                table: "products",
                column: "OrganizationId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_products_OrganizationId",
                table: "products");

            migrationBuilder.DropColumn(
                name: "OrganizationId",
                table: "products");
        }
    }
}
