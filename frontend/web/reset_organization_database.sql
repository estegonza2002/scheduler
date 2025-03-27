-- Reset and clean up database for testing
-- This script will reset the organizations and organization_members tables
-- Warning: This will delete all data in these tables

-- First disable RLS to allow delete operations
ALTER TABLE "public"."organizations" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."organization_members" DISABLE ROW LEVEL SECURITY;

-- Delete all organization members first (due to foreign key constraints)
DELETE FROM "public"."organization_members";

-- Then delete all organizations
DELETE FROM "public"."organizations";

-- Reset sequences if they exist
ALTER SEQUENCE IF EXISTS "public"."organizations_id_seq" RESTART WITH 1;
ALTER SEQUENCE IF EXISTS "public"."organization_members_id_seq" RESTART WITH 1;

-- Re-apply triggers
DROP TRIGGER IF EXISTS on_organization_created ON public.organizations;

CREATE OR REPLACE FUNCTION public.handle_new_organization()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.organization_members (organization_id, user_id, role)
  VALUES (NEW.id, auth.uid(), 'owner');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_organization_created
  AFTER INSERT ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_organization();

-- Re-apply policies from fix_organization_policies.sql
-- Organizations policies
CREATE POLICY IF NOT EXISTS "organizations_select_all" ON "public"."organizations"
  FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "organizations_insert_auth" ON "public"."organizations"
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY IF NOT EXISTS "organizations_update_owner" ON "public"."organizations"
  FOR UPDATE USING (
    id IN (
      SELECT organization_id 
      FROM public.organization_members 
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  );

CREATE POLICY IF NOT EXISTS "organizations_delete_owner" ON "public"."organizations"
  FOR DELETE USING (
    id IN (
      SELECT organization_id 
      FROM public.organization_members 
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  );

-- Organization members policies
CREATE POLICY IF NOT EXISTS "organization_members_select_own" ON "public"."organization_members"
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY IF NOT EXISTS "organization_members_select_org" ON "public"."organization_members"
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id 
      FROM public.organization_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY IF NOT EXISTS "organization_members_insert_admin" ON "public"."organization_members"
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL
  );

CREATE POLICY IF NOT EXISTS "organization_members_update_owner" ON "public"."organization_members"
  FOR UPDATE USING (
    organization_id IN (
      SELECT organization_id 
      FROM public.organization_members 
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  );

CREATE POLICY IF NOT EXISTS "organization_members_delete_owner" ON "public"."organization_members"
  FOR DELETE USING (
    organization_id IN (
      SELECT organization_id 
      FROM public.organization_members 
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  );

-- Keep RLS disabled for development
ALTER TABLE "public"."organizations" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."organization_members" DISABLE ROW LEVEL SECURITY;

-- Optional: Verify data was deleted
SELECT COUNT(*) FROM "public"."organizations";
SELECT COUNT(*) FROM "public"."organization_members";

-- Print success message
DO $$
BEGIN
  RAISE NOTICE 'Database reset completed successfully. Organizations and organization_members tables have been cleaned.';
END $$; 