namespace SIM.WebApi.Auth;

/// <summary>
/// Role constants for use in [Authorize(Roles = ...)] attributes.
/// Values must match exactly the UserRole enum names.
/// </summary>
public static class Roles
{
    /// <summary>SIM internal support team. Always belongs to the SimSuporte organization.</summary>
    public const string SuperAdmin        = "SuperAdmin";

    /// <summary>Organization-level administrator. Manages users within their own org.</summary>
    public const string Admin             = "Admin";

    public const string Pharmacist        = "Pharmacist";
    public const string StockManager      = "StockManager";
    public const string ReceivingOperator = "ReceivingOperator";

    public const string AdminOrStockManager =
        Admin + "," + StockManager;

    public const string AllRoles =
        SuperAdmin + "," + Admin + "," + Pharmacist + "," + StockManager + "," + ReceivingOperator;
}
