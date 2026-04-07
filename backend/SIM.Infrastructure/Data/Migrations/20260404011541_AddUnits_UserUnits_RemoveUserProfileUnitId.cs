using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SIM.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddUnits_UserUnits_RemoveUserProfileUnitId : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "UnitId",
                table: "user_profiles");

            migrationBuilder.AlterColumn<string>(
                name: "Description",
                table: "products",
                type: "character varying(1000)",
                maxLength: 1000,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(1000)",
                oldMaxLength: 1000);

            migrationBuilder.AddColumn<string>(
                name: "BarCode",
                table: "products",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "CategoryId",
                table: "products",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "RequiresBatchTracking",
                table: "products",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "Type",
                table: "products",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateTable(
                name: "medication_details",
                columns: table => new
                {
                    ProductId = table.Column<Guid>(type: "uuid", nullable: false),
                    GenericName = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: true),
                    ActiveIngredient = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: true),
                    Presentation = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Concentration = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    IsControlled = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_medication_details", x => x.ProductId);
                    table.ForeignKey(
                        name: "FK_medication_details_products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "units",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Code = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Address = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Phone = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    OrganizationId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_units", x => x.Id);
                    table.ForeignKey(
                        name: "FK_units_organizations_OrganizationId",
                        column: x => x.OrganizationId,
                        principalTable: "organizations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "user_units",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    UnitId = table.Column<Guid>(type: "uuid", nullable: false),
                    OrganizationId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_user_units", x => x.Id);
                    table.ForeignKey(
                        name: "FK_user_units_organizations_OrganizationId",
                        column: x => x.OrganizationId,
                        principalTable: "organizations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_user_units_units_UnitId",
                        column: x => x.UnitId,
                        principalTable: "units",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_user_units_user_profiles_UserId",
                        column: x => x.UserId,
                        principalTable: "user_profiles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_products_OrganizationId_BarCode",
                table: "products",
                columns: new[] { "OrganizationId", "BarCode" },
                unique: true,
                filter: "\"BarCode\" IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_units_OrganizationId_Code",
                table: "units",
                columns: new[] { "OrganizationId", "Code" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_user_units_OrganizationId",
                table: "user_units",
                column: "OrganizationId");

            migrationBuilder.CreateIndex(
                name: "IX_user_units_UnitId",
                table: "user_units",
                column: "UnitId");

            migrationBuilder.CreateIndex(
                name: "IX_user_units_UserId_UnitId",
                table: "user_units",
                columns: new[] { "UserId", "UnitId" },
                unique: true,
                filter: "\"IsActive\" = true"); 
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "medication_details");

            migrationBuilder.DropTable(
                name: "user_units");

            migrationBuilder.DropTable(
                name: "units");

            migrationBuilder.DropIndex(
                name: "IX_products_OrganizationId_BarCode",
                table: "products");

            migrationBuilder.DropColumn(
                name: "BarCode",
                table: "products");

            migrationBuilder.DropColumn(
                name: "CategoryId",
                table: "products");

            migrationBuilder.DropColumn(
                name: "RequiresBatchTracking",
                table: "products");

            migrationBuilder.DropColumn(
                name: "Type",
                table: "products");

            migrationBuilder.AddColumn<Guid>(
                name: "UnitId",
                table: "user_profiles",
                type: "uuid",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Description",
                table: "products",
                type: "character varying(1000)",
                maxLength: 1000,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "character varying(1000)",
                oldMaxLength: 1000,
                oldNullable: true);
        }
    }
}
