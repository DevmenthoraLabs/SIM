CREATE TABLE IF NOT EXISTS "__EFMigrationsHistory" (
    "MigrationId" character varying(150) NOT NULL,
    "ProductVersion" character varying(32) NOT NULL,
    CONSTRAINT "PK___EFMigrationsHistory" PRIMARY KEY ("MigrationId")
);

START TRANSACTION;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260328042200_InitialCreate') THEN
    CREATE TABLE organizations (
        "Id" uuid NOT NULL,
        "Name" character varying(200) NOT NULL,
        "Cnpj" character varying(14) NOT NULL,
        "Type" character varying(20) NOT NULL,
        "CreatedAt" timestamp with time zone NOT NULL,
        "UpdatedAt" timestamp with time zone,
        "IsActive" boolean NOT NULL,
        CONSTRAINT "PK_organizations" PRIMARY KEY ("Id")
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260328042200_InitialCreate') THEN
    CREATE TABLE products (
        "Id" uuid NOT NULL,
        "Name" character varying(200) NOT NULL,
        "Description" character varying(1000) NOT NULL,
        "CreatedAt" timestamp with time zone NOT NULL,
        "UpdatedAt" timestamp with time zone,
        "IsActive" boolean NOT NULL,
        CONSTRAINT "PK_products" PRIMARY KEY ("Id")
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260328042200_InitialCreate') THEN
    CREATE TABLE user_profiles (
        "Id" uuid NOT NULL,
        "FullName" character varying(200) NOT NULL,
        "Email" character varying(320) NOT NULL,
        "Role" character varying(30) NOT NULL,
        "OrganizationId" uuid NOT NULL,
        "UnitId" uuid,
        "CreatedAt" timestamp with time zone NOT NULL,
        "UpdatedAt" timestamp with time zone,
        "IsActive" boolean NOT NULL,
        CONSTRAINT "PK_user_profiles" PRIMARY KEY ("Id"),
        CONSTRAINT "FK_user_profiles_organizations_OrganizationId" FOREIGN KEY ("OrganizationId") REFERENCES organizations ("Id") ON DELETE RESTRICT
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260328042200_InitialCreate') THEN
    CREATE UNIQUE INDEX "IX_organizations_Cnpj" ON organizations ("Cnpj");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260328042200_InitialCreate') THEN
    CREATE UNIQUE INDEX "IX_user_profiles_Email" ON user_profiles ("Email");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260328042200_InitialCreate') THEN
    CREATE INDEX "IX_user_profiles_OrganizationId" ON user_profiles ("OrganizationId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260328042200_InitialCreate') THEN
    INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
    VALUES ('20260328042200_InitialCreate', '10.0.4');
    END IF;
END $EF$;
COMMIT;

START TRANSACTION;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260328213508_SeedSimSuporteOrganization') THEN
    INSERT INTO organizations ("Id", "Name", "Cnpj", "Type", "CreatedAt", "UpdatedAt", "IsActive")
    VALUES (
        '00000000-0000-0000-0000-000000000001',
        'SIM Suporte',
        '00000000000000',
        'Private',
        NOW(),
        NULL,
        true
    )
    ON CONFLICT ("Id") DO NOTHING;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260328213508_SeedSimSuporteOrganization') THEN
    INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
    VALUES ('20260328213508_SeedSimSuporteOrganization', '10.0.4');
    END IF;
END $EF$;
COMMIT;

START TRANSACTION;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260330031904_AddOrganizationIdToProducts') THEN
    ALTER TABLE products ADD "OrganizationId" uuid NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260330031904_AddOrganizationIdToProducts') THEN
    CREATE INDEX "IX_products_OrganizationId" ON products ("OrganizationId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260330031904_AddOrganizationIdToProducts') THEN
    INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
    VALUES ('20260330031904_AddOrganizationIdToProducts', '10.0.4');
    END IF;
END $EF$;
COMMIT;

START TRANSACTION;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260330033950_AddProductOrganizationForeignKey') THEN
    ALTER TABLE products ADD CONSTRAINT "FK_products_organizations_OrganizationId" FOREIGN KEY ("OrganizationId") REFERENCES organizations ("Id") ON DELETE RESTRICT;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260330033950_AddProductOrganizationForeignKey') THEN
    INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
    VALUES ('20260330033950_AddProductOrganizationForeignKey', '10.0.4');
    END IF;
END $EF$;
COMMIT;

