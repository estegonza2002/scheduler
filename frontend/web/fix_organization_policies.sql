-- Drop all existing organization policies to start fresh
DROP POLICY IF EXISTS "organization_members_select" ON "public"."organization_members";
DROP POLICY IF EXISTS "organization_members_insert" ON "public"."organization_members";
DROP POLICY IF EXISTS "organization_members_update" ON "public"."organization_members";
DROP POLICY IF EXISTS "organization_members_delete" ON "public"."organization_members";
DROP POLICY IF EXISTS "organizations_select" ON "public"."organizations";
DROP POLICY IF EXISTS "organizations_insert" ON "public"."organizations";
DROP POLICY IF EXISTS "organizations_update" ON "public"."organizations";
DROP POLICY IF EXISTS "organizations_delete" ON "public"."organizations";

-- Create simple non-recursive policies
-- Allow users to see all organizations (simplify for development)
CREATE POLICY "organizations_select_all" ON "public"."organizations"
  FOR SELECT USING (true);

-- Only authenticated users can insert organizations
CREATE POLICY "organizations_insert_auth" ON "public"."organizations"
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Allow users to see organization_members records they belong to
CREATE POLICY "organization_members_select_own" ON "public"."organization_members"
  FOR SELECT USING (user_id = auth.uid());

-- Allow users to see members of organizations they belong to
CREATE POLICY "organization_members_select_org" ON "public"."organization_members"
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id 
      FROM public.organization_members 
      WHERE user_id = auth.uid()
    )
  );

-- Fix for possible broken triggers
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

-- Allow admins to insert organization_members
CREATE POLICY "organization_members_insert_admin" ON "public"."organization_members"
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL
  );

-- Allow owners to update organization details
CREATE POLICY "organizations_update_owner" ON "public"."organizations"
  FOR UPDATE USING (
    id IN (
      SELECT organization_id 
      FROM public.organization_members 
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  );

-- Allow owners to delete organizations
CREATE POLICY "organizations_delete_owner" ON "public"."organizations"
  FOR DELETE USING (
    id IN (
      SELECT organization_id 
      FROM public.organization_members 
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  );

-- Allow owners to update organization_members
CREATE POLICY "organization_members_update_owner" ON "public"."organization_members"
  FOR UPDATE USING (
    organization_id IN (
      SELECT organization_id 
      FROM public.organization_members 
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  );

-- Allow owners to delete organization_members
CREATE POLICY "organization_members_delete_owner" ON "public"."organization_members"
  FOR DELETE USING (
    organization_id IN (
      SELECT organization_id 
      FROM public.organization_members 
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  );

-- Enable row level security on both tables
ALTER TABLE "public"."organizations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."organization_members" ENABLE ROW LEVEL SECURITY;

-- For developing convenience, display all rows to clients
-- Note: In production environment, consider enabling RLS on both tables
ALTER TABLE "public"."organizations" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."organization_members" DISABLE ROW LEVEL SECURITY; 