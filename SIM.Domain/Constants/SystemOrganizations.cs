namespace SIM.Domain.Constants;

/// <summary>
/// Fixed UUIDs for system-level organizations seeded at database initialization.
/// These records are NOT created via the API — they are part of the initial migration.
/// </summary>
public static class SystemOrganizations
{
    /// <summary>
    /// The internal SIM support organization.
    /// All SuperAdmin users belong to this organization.
    /// This UUID is fixed and must never change after the first migration is applied.
    /// </summary>
    public static readonly Guid SimSuporte = new("00000000-0000-0000-0000-000000000001");
}
