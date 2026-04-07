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

    // Unit
    public const string UnitNameRequired = "Unit name is required.";
    public const string UnitNameTooLong = "Unit name must not exceed 200 characters.";
    public const string UnitCodeRequired = "Unit code is required.";
    public const string UnitCodeTooLong = "Unit code must not exceed 20 characters.";
    public const string UnitCodeAlreadyExists = "A unit with this code already exists in the organization.";
    public const string UnitPhoneTooLong = "Phone must not exceed 20 characters.";
    public const string UnitNotFound = "Unit not found.";
    public const string UnitInactive = "This unit is inactive and cannot be edited.";
    public const string UnitAlreadyInactive = "This unit is already inactive.";
    public const string UnitInactiveCannotManageUsers = "This unit is inactive. User assignments cannot be modified.";
    public const string UnitNotFoundOrInactive = "One or more units were not found or are inactive.";
    public const string UnitRequiredForRole = "At least one unit must be assigned for this role.";
    public const string UnitIdRequired = "Unit ID is required.";

    // UserUnit
    public const string UserUnitAlreadyActive = "This user is already assigned to the unit.";
    public const string UserUnitNotFound = "User is not assigned to this unit.";
    public const string CannotRemoveLastUnitAssignment = "Cannot remove the user's last active unit assignment.";
    public const string SuperAdminCannotBeAssignedToUnit = "SuperAdmin users cannot be assigned to a unit.";

    // Category
    public const string CategoryNameRequired = "Category name is required.";
    public const string CategoryNameTooLong = "Category name must not exceed 100 characters.";
    public const string CategoryNotFound = "Category not found.";
    public const string CategoryInactive = "This category is inactive and cannot be edited.";
    public const string CategoryAlreadyInactive = "This category is already inactive.";
    public const string CategoryNameAlreadyExists = "A category with this name already exists in the organization.";
    public const string CategoryParentNotFound = "Parent category not found.";
    public const string CategoryParentMustBeRoot = "Parent category must be a root category (no parent of its own).";
    public const string CategoryCannotBeItsOwnParent = "A category cannot be its own parent.";
    public const string CategoryParentInactive = "The parent category is inactive.";
    public const string CategoryHasActiveProducts = "This category has active products assigned to it. Reassign them before deactivating.";
    public const string CategoryHasActiveChildren = "This category has active sub-categories. Deactivate them before deactivating the parent.";

    // Product
    public const string ProductNameRequired = "Product name is required.";
    public const string ProductNameTooLong = "Product name must not exceed 200 characters.";
    public const string ProductNotFound = "Product not found.";
    public const string ProductDescriptionTooLong = "Product description must not exceed 1000 characters.";
    public const string ProductBarCodeTooLong = "Bar code must not exceed 50 characters.";
    public const string ProductTypeInvalid = "Type must be a valid ProductType.";
}
