-- Create extension for UUID generation if it doesn't exist
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Organizations table
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Organization Members table (for proper user-organization relationships)
CREATE TABLE IF NOT EXISTS organization_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'member')),
  UNIQUE (organization_id, user_id)
);

-- Add a function to automatically create an organization when a user signs up
CREATE OR REPLACE FUNCTION handle_new_user() 
RETURNS TRIGGER AS $$
DECLARE
  new_org_id UUID;
BEGIN
  -- Create a default organization for the user
  INSERT INTO organizations (name, owner_id, description)
  VALUES ('My Organization', NEW.id, 'Your default organization')
  RETURNING id INTO new_org_id;
  
  -- Add the user as an owner of the organization
  INSERT INTO organization_members (organization_id, user_id, role)
  VALUES (new_org_id, NEW.id, 'owner');
  
  -- Update user metadata to include the current organization ID
  UPDATE auth.users
  SET raw_user_meta_data = 
    CASE 
      WHEN raw_user_meta_data IS NULL THEN 
        jsonb_build_object('current_organization_id', new_org_id)
      ELSE
        raw_user_meta_data || jsonb_build_object('current_organization_id', new_org_id)
    END
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to call the function when a new user is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Set up RLS (Row Level Security) for organizations
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Policy: Users can see organizations they are members of
CREATE POLICY "Users can view their organizations" 
  ON organizations FOR SELECT 
  USING (
    id IN (
      SELECT organization_id 
      FROM organization_members 
      WHERE user_id = auth.uid()
    )
  );

-- Policy: Only owners can update their organizations
CREATE POLICY "Owners can update their organizations" 
  ON organizations FOR UPDATE 
  USING (
    owner_id = auth.uid()
  );

-- Policy: Users can insert organizations (since they will be the owner)
CREATE POLICY "Users can create organizations" 
  ON organizations FOR INSERT 
  WITH CHECK (
    owner_id = auth.uid()
  );

-- Policy: Only owners can delete their organizations
CREATE POLICY "Owners can delete their organizations" 
  ON organizations FOR DELETE 
  USING (
    owner_id = auth.uid()
  );

-- Set up RLS for organization members
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;

-- Policy: Members can see other members in their organizations
CREATE POLICY "Members can view other members in their organizations" 
  ON organization_members FOR SELECT 
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM organization_members 
      WHERE user_id = auth.uid()
    )
  );

-- Policy: Only admins and owners can add members to their organizations
CREATE POLICY "Admins and owners can add members to their organizations" 
  ON organization_members FOR INSERT 
  WITH CHECK (
    organization_id IN (
      SELECT organization_id 
      FROM organization_members 
      WHERE user_id = auth.uid() AND role IN ('admin', 'owner')
    )
  );

-- Policy: Only admins and owners can update members in their organizations
CREATE POLICY "Admins and owners can update members in their organizations" 
  ON organization_members FOR UPDATE 
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM organization_members 
      WHERE user_id = auth.uid() AND role IN ('admin', 'owner')
    )
  );

-- Policy: Only admins and owners can delete members from their organizations
CREATE POLICY "Admins and owners can delete members from their organizations" 
  ON organization_members FOR DELETE 
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM organization_members 
      WHERE user_id = auth.uid() AND role IN ('admin', 'owner')
    )
  );

-- Create a custom type for returning organization info including membership
CREATE TYPE organization_with_role AS (
  id UUID,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  name TEXT,
  description TEXT,
  logo_url TEXT,
  owner_id UUID,
  role TEXT
);

-- Create a function to get organizations for the current user with their roles
CREATE OR REPLACE FUNCTION get_my_organizations()
RETURNS SETOF organization_with_role AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER; 