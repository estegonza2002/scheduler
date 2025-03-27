-- Drop existing policies that might be causing infinite recursion
DROP POLICY IF EXISTS "organization_members_select" ON "public"."organization_members";
DROP POLICY IF EXISTS "organization_members_insert" ON "public"."organization_members";
DROP POLICY IF EXISTS "organization_members_update" ON "public"."organization_members";
DROP POLICY IF EXISTS "organization_members_delete" ON "public"."organization_members";

-- Make sure the organization tables exist
CREATE TABLE IF NOT EXISTS "public"."organizations" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "name" TEXT NOT NULL,
  "description" TEXT,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "public"."organization_members" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "organization_id" UUID REFERENCES "public"."organizations"("id") ON DELETE CASCADE,
  "user_id" UUID REFERENCES "auth"."users"("id") ON DELETE CASCADE,
  "role" TEXT NOT NULL DEFAULT 'member',
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE ("organization_id", "user_id")
);

-- Enable Row Level Security
ALTER TABLE "public"."organizations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."organization_members" ENABLE ROW LEVEL SECURITY;

-- Create safe RLS policies without circular dependencies
CREATE POLICY "organizations_select" ON "public"."organizations"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM "public"."organization_members"
      WHERE "organization_members"."organization_id" = "organizations"."id"
      AND "organization_members"."user_id" = auth.uid()
    )
  );

-- Allow insertion of organizations by any authenticated user
CREATE POLICY "organizations_insert" ON "public"."organizations"
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Organization members policies
CREATE POLICY "organization_members_select" ON "public"."organization_members"
  FOR SELECT USING (
    "user_id" = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM "public"."organization_members" om 
      WHERE om."organization_id" = "organization_members"."organization_id"
      AND om."user_id" = auth.uid()
      AND om."role" IN ('admin', 'owner')
    )
  );

-- Allow insertion of organization members by organization admins/owners
CREATE POLICY "organization_members_insert" ON "public"."organization_members"
  FOR INSERT WITH CHECK (
    -- Users can add themselves to an organization
    "user_id" = auth.uid() OR
    -- Admins/owners can add others
    EXISTS (
      SELECT 1 FROM "public"."organization_members" om 
      WHERE om."organization_id" = "organization_members"."organization_id"
      AND om."user_id" = auth.uid()
      AND om."role" IN ('admin', 'owner')
    )
  );

-- Special trigger function to automatically add the creator as an owner
CREATE OR REPLACE FUNCTION public.handle_new_organization()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.organization_members (organization_id, user_id, role)
  VALUES (NEW.id, auth.uid(), 'owner');
  RETURN NEW;
END;
$$;

-- Create trigger to add organization creator as owner
DROP TRIGGER IF EXISTS on_organization_created ON public.organizations;
CREATE TRIGGER on_organization_created
  AFTER INSERT ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_organization(); 