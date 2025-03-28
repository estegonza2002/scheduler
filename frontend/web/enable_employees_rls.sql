-- First drop any existing policies
DROP POLICY IF EXISTS "employees_select" ON "public"."employees";
DROP POLICY IF EXISTS "employees_insert" ON "public"."employees";
DROP POLICY IF EXISTS "employees_update" ON "public"."employees";
DROP POLICY IF EXISTS "employees_delete" ON "public"."employees";

-- Enable Row Level Security on employees table
ALTER TABLE "public"."employees" ENABLE ROW LEVEL SECURITY;

-- Create policy to allow organization members to view employees in their organization
CREATE POLICY "employees_select" ON "public"."employees"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM "public"."organization_members"
      WHERE "organization_members"."organization_id" = "employees"."organization_id"
      AND "organization_members"."user_id" = auth.uid()
    )
  );

-- Create policy to allow any organization member to insert employees
CREATE POLICY "employees_insert" ON "public"."employees"
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM "public"."organization_members"
      WHERE "organization_members"."organization_id" = "employees"."organization_id"
      AND "organization_members"."user_id" = auth.uid()
    )
  );

-- Create policy to allow organization members with admin/owner role to update employees
CREATE POLICY "employees_update" ON "public"."employees"
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM "public"."organization_members"
      WHERE "organization_members"."organization_id" = "employees"."organization_id"
      AND "organization_members"."user_id" = auth.uid()
      AND "organization_members"."role" IN ('admin', 'owner')
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM "public"."organization_members"
      WHERE "organization_members"."organization_id" = "employees"."organization_id"
      AND "organization_members"."user_id" = auth.uid()
      AND "organization_members"."role" IN ('admin', 'owner')
    )
  );

-- Create policy to allow organization members with admin/owner role to delete employees
CREATE POLICY "employees_delete" ON "public"."employees"
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM "public"."organization_members"
      WHERE "organization_members"."organization_id" = "employees"."organization_id"
      AND "organization_members"."user_id" = auth.uid()
      AND "organization_members"."role" IN ('admin', 'owner')
    )
  ); 