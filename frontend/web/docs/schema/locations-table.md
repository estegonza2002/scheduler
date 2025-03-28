# Fix Locations Table Schema

This SQL script will ensure your locations table properly supports organization IDs.

```sql
-- Check if organization_id column exists, if not add it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'locations'
        AND column_name = 'organization_id'
    ) THEN
        ALTER TABLE locations ADD COLUMN organization_id UUID REFERENCES organizations(id);
    END IF;
END $$;

-- Ensure organization_id is NOT NULL
ALTER TABLE locations ALTER COLUMN organization_id SET NOT NULL;

-- Enable RLS on locations table
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to view locations in their organizations
CREATE POLICY IF NOT EXISTS view_locations ON locations
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM organization_members
        WHERE organization_id = locations.organization_id
        AND user_id = auth.uid()
    )
);

-- Create policy to allow organization members to insert locations
CREATE POLICY IF NOT EXISTS insert_locations ON locations
FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM organization_members
        WHERE organization_id = locations.organization_id
        AND user_id = auth.uid()
    )
);

-- Create policy to allow organization members to update locations
CREATE POLICY IF NOT EXISTS update_locations ON locations
FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM organization_members
        WHERE organization_id = locations.organization_id
        AND user_id = auth.uid()
    )
);

-- Create policy to allow organization members to delete locations
CREATE POLICY IF NOT EXISTS delete_locations ON locations
FOR DELETE USING (
    EXISTS (
        SELECT 1 FROM organization_members
        WHERE organization_id = locations.organization_id
        AND user_id = auth.uid()
    )
);
```

## If you're getting errors about organization_id being NULL

If you have existing data in your locations table and you're getting errors about the organization_id being NULL after adding the NOT NULL constraint, you can update all existing records to use the default organization:

```sql
-- Find the first organization (use as default)
DO $$
DECLARE
    default_org_id UUID;
BEGIN
    -- Get the first organization ID
    SELECT id INTO default_org_id FROM organizations LIMIT 1;

    -- If we found an organization, update all locations without an organization_id
    IF default_org_id IS NOT NULL THEN
        UPDATE locations
        SET organization_id = default_org_id
        WHERE organization_id IS NULL;
    END IF;
END $$;
```

## Creating the locations table from scratch

If you need to create the locations table from scratch:

```sql
CREATE TABLE IF NOT EXISTS locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    name TEXT NOT NULL,
    address TEXT,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    organization_id UUID REFERENCES organizations(id) NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    phone TEXT,
    email TEXT,
    country TEXT
);
```
