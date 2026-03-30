using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SIM.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddProductOrganizationForeignKey : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddForeignKey(
                name: "FK_products_organizations_OrganizationId",
                table: "products",
                column: "OrganizationId",
                principalTable: "organizations",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_products_organizations_OrganizationId",
                table: "products");
        }
    }
}
