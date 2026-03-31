namespace SIM.Domain.Constants;

/// <summary>
/// Role constants for authorization. Values must match the UserRole enum names exactly.
/// Used in [Authorize(Roles = ...)] attributes and policy definitions.
/// </summary>
public static class Roles
{
    public const string SuperAdmin        = "SuperAdmin";
    public const string Admin             = "Admin";
    public const string Pharmacist        = "Pharmacist";
    public const string StockManager      = "StockManager";
    public const string ReceivingOperator = "ReceivingOperator";

    public const string AdminOrStockManager =
        Admin + "," + StockManager;

    public const string AllRoles =
        SuperAdmin + "," + Admin + "," + Pharmacist + "," + StockManager + "," + ReceivingOperator;
}
