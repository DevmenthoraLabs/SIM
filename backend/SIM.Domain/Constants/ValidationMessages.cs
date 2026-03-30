namespace SIM.Domain.Constants;

public static class ValidationMessages
{
    // Auth
    public const string PasswordRequired = "Password is required.";
    public const string PasswordTooShort = "Password must be at least 8 characters.";
    public const string InvalidCredentials = "Invalid email or password.";
    public const string RefreshTokenRequired = "Refresh token is required.";
    public const string InvalidRefreshToken = "Invalid or expired refresh token.";
    public const string TokenHashRequired = "Token is required.";
    public const string TokenTypeInvalid = "Token type must be 'invite' or 'recovery'.";
    public const string InvalidOrExpiredToken = "Token is invalid or has expired. Please request a new invitation.";
    public const string SetPasswordFailed = "Failed to set password. Please try again.";

    // User Profile
    public const string UserRoleInvalid = "Role must be a valid UserRole.";
    public const string FullNameRequired = "Full name is required.";
    public const string FullNameTooLong = "Full name must not exceed 200 characters.";
    public const string EmailRequired = "Email is required.";
    public const string EmailInvalid = "Email must be a valid address.";
    public const string EmailAlreadyExists = "A user with this email already exists.";
    public const string UserNotFound = "User not found.";
    public const string UserIdRequired = "User ID is required.";
    public const string InviteUserFailed = "Failed to send user invitation. Please try again.";

    // Organization
    public const string OrganizationTypeInvalid = "Type must be a valid OrganizationType.";
    public const string OrganizationNameRequired = "Organization name is required.";
    public const string OrganizationNameTooLong = "Organization name must not exceed 200 characters.";
    public const string OrganizationRequired = "Organization ID is required.";
    public const string OrganizationNotFound = "Organization not found.";
    public const string CnpjRequired = "CNPJ is required.";
    public const string CnpjInvalid = "CNPJ must contain 14 numeric digits.";

    public const string CannotAssignSuperAdminRole = "Admin users cannot assign the SuperAdmin role.";
    public const string CannotChangeOwnRole        = "You cannot change your own role.";
    public const string OrganizationAccessDenied   = "You can only manage users within your own organization.";
    public const string SuperAdminMustBelongToSimSuporte = "SuperAdmin users must belong to the SimSuporte organization.";

    // Product
    public const string ProductNameRequired = "Product name is required.";
    public const string ProductNameTooLong = "Product name must not exceed 200 characters.";
    public const string ProductNotFound = "Product not found.";
    public const string ProductDescriptionTooLong = "Product description must not exceed 1000 characters.";
}
