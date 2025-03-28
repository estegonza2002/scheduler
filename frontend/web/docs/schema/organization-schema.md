# Organization Schema Deployment Guide

This guide explains how to deploy the organization schema to your Supabase project.

## Instructions

1. Navigate to your Supabase project dashboard
2. Go to the SQL Editor section
3. Create a new query
4. Copy and paste the SQL below
5. Run the query

## SQL Script

```sql
-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Organizations table
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL
);

-- Organization members table
CREATE TABLE IF NOT EXISTS organization_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT CHECK (role IN ('owner', 'admin', 'member')) NOT NULL DEFAULT 'member',
  UNIQUE (organization_id, user_id)
);

-- Function to automatically create a default organization for new users
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_org_id UUID;
BEGIN
  -- Create a default organization for the user
  INSERT INTO organizations (name, owner_id, description)
  VALUES (
    'My Organization',
    NEW.id,
    'Default organization created automatically'
  )
  RETURNING id INTO new_org_id;

  -- Add the user as owner of the organization
  INSERT INTO organization_members (organization_id, user_id, role)
  VALUES (new_org_id, NEW.id, 'owner');

  -- Update user metadata with the organization ID
  UPDATE auth.users
  SET raw_user_meta_data =
    COALESCE(raw_user_meta_data, '{}'::jsonb) ||
    jsonb_build_object('current_organization_id', new_org_id)
  WHERE id = NEW.id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to run after a user is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- RLS policies for organizations

-- Enable RLS on organizations table
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view organizations they are members of
CREATE POLICY view_organization ON organizations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_id = organizations.id
      AND user_id = auth.uid()
    )
  );

-- Policy: Only owners and admins can update their organizations
CREATE POLICY update_organization ON organizations
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_id = organizations.id
      AND user_id = auth.uid()
      AND role IN ('owner', 'admin')
    )
  );

-- Policy: Only owners can delete their organizations
CREATE POLICY delete_organization ON organizations
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_id = organizations.id
      AND user_id = auth.uid()
      AND role = 'owner'
    )
  );

-- Policy: Users can create organizations
CREATE POLICY insert_organization ON organizations
  FOR INSERT WITH CHECK (
    owner_id = auth.uid()
  );

-- RLS policies for organization_members

-- Enable RLS on organization_members table
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view members of organizations they belong to
CREATE POLICY view_organization_members ON organization_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organization_id = organization_members.organization_id
      AND om.user_id = auth.uid()
    )
  );

-- Policy: Only owners and admins can add members to their organizations
CREATE POLICY insert_organization_members ON organization_members
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_id = organization_members.organization_id
      AND user_id = auth.uid()
      AND role IN ('owner', 'admin')
    )
  );

-- Policy: Only owners and admins can update members in their organizations
CREATE POLICY update_organization_members ON organization_members
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_id = organization_members.organization_id
      AND user_id = auth.uid()
      AND role IN ('owner', 'admin')
    )
  );

-- Policy: Only owners can remove members from their organizations
CREATE POLICY delete_organization_members ON organization_members
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_id = organization_members.organization_id
      AND user_id = auth.uid()
      AND role = 'owner'
    )
  );

-- Helper function to get organizations for the current user
CREATE OR REPLACE FUNCTION get_my_organizations()
RETURNS TABLE (
  id UUID,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  name TEXT,
  description TEXT,
  logo_url TEXT,
  owner_id UUID,
  role TEXT
) SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    o.id,
    o.created_at,
    o.updated_at,
    o.name,
    o.description,
    o.logo_url,
    o.owner_id,
    om.role
  FROM organizations o
  JOIN organization_members om ON o.id = om.organization_id
  WHERE om.user_id = auth.uid();
END;
$$ LANGUAGE plpgsql;

-- Update functions for existing locations, employees and other tables to use RLS
-- Make sure to update all tables that reference organization_id to have proper RLS policies
```

## Post-Deployment Steps

After running the schema script, you need to:

1. Make sure your existing location, employee, and shift tables have appropriate RLS policies that reference the organizations and organization_members tables.

2. If you already have data in your database, you'll need to migrate it to work with the new organization schema:

```sql
-- Example migration script for existing data (adjust as needed)
-- This assumes you have one organization per user currently
DO $$
DECLARE
  user_record RECORD;
  new_org_id UUID;
BEGIN
  FOR user_record IN SELECT id FROM auth.users LOOP
    -- Check if user already has an organization
    IF NOT EXISTS (
      SELECT 1 FROM organizations WHERE owner_id = user_record.id
    ) THEN
      -- Create organization
      INSERT INTO organizations (name, owner_id)
      VALUES ('My Organization', user_record.id)
      RETURNING id INTO new_org_id;

      -- Add membership
      INSERT INTO organization_members (organization_id, user_id, role)
      VALUES (new_org_id, user_record.id, 'owner');

      -- Update user metadata
      UPDATE auth.users
      SET raw_user_meta_data =
        COALESCE(raw_user_meta_data, '{}'::jsonb) ||
        jsonb_build_object('current_organization_id', new_org_id)
      WHERE id = user_record.id;

      -- Update existing resources to reference the new organization
      -- Example (adjust table and column names as needed):
      -- UPDATE locations SET organization_id = new_org_id WHERE created_by = user_record.id;
      -- UPDATE employees SET organization_id = new_org_id WHERE created_by = user_record.id;
    END IF;
  END LOOP;
END
$$;
```

3. Test that your application works correctly with the new schema

4. Update your other tables to ensure they have the appropriate RLS policies referencing organization membership
