-- =============================================================================
-- SIM Custom Access Token Hook
-- =============================================================================
-- Runs every time Supabase generates a JWT (login + token refresh).
-- Reads sim_role and organization_id from user_profiles and injects them
-- as top-level claims so the API never needs to query the DB per request.
--
-- SETUP STEPS:
-- 1. Run this entire script in the Supabase SQL Editor.
-- 2. In the Supabase Dashboard: Authentication → Hooks
--    → Custom Access Token Hook → select "public.custom_access_token_hook"
-- =============================================================================

CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_role text;
  v_org  text;
  claims jsonb;
BEGIN
  -- Column names are PascalCase because EF Core preserves C# property names by default.
  SELECT "Role"::text, "OrganizationId"::text
    INTO v_role, v_org
    FROM public.user_profiles
   WHERE "Id" = (event->>'user_id')::uuid
     AND "IsActive" = true;

  claims := event -> 'claims';

  IF v_role IS NOT NULL THEN
    claims := jsonb_set(claims, '{sim_role}',            to_jsonb(v_role));
    claims := jsonb_set(claims, '{sim_organization_id}', to_jsonb(v_org));
  END IF;

  RETURN jsonb_build_object('claims', claims);
END;
$$;

-- Allow supabase_auth_admin to read user_profiles during token generation.
GRANT SELECT ON TABLE public.user_profiles TO supabase_auth_admin;

-- Allow supabase_auth_admin to call the hook function.
GRANT EXECUTE ON FUNCTION public.custom_access_token_hook TO supabase_auth_admin;

-- Prevent direct calls from authenticated/anon clients.
REVOKE EXECUTE ON FUNCTION public.custom_access_token_hook FROM authenticated, anon, public;
