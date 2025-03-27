-- SQL migrations to fix schema inconsistencies
-- First, create a function to set up procedures for fixing schema

CREATE OR REPLACE FUNCTION create_schema_fix_procedures()
RETURNS void AS $$
BEGIN
    -- Function to migrate data from organizationId to organization_id
    CREATE OR REPLACE FUNCTION migrate_location_organization_id()
    RETURNS void AS $inner$
    BEGIN
        -- Ensure organization_id contains the same values as organizationId
        UPDATE locations
        SET organization_id = organizationId
        WHERE organizationId IS NOT NULL;
        
        -- Return success
        RETURN;
    END;
    $inner$ LANGUAGE plpgsql;

    -- Function to drop the organizationId column
    CREATE OR REPLACE FUNCTION drop_location_organizationId()
    RETURNS void AS $inner$
    BEGIN
        -- First check if the column exists
        IF EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_name = 'locations' AND column_name = 'organizationId'
        ) THEN
            -- Drop the column
            ALTER TABLE locations DROP COLUMN IF EXISTS "organizationId";
        END IF;
        
        -- Return success
        RETURN;
    END;
    $inner$ LANGUAGE plpgsql;
END;
$$ LANGUAGE plpgsql;

-- Consistency check function - to be run before creating a location
CREATE OR REPLACE FUNCTION validate_location_data()
RETURNS TRIGGER AS $$
BEGIN
    -- Ensure organization_id is set if organizationId is provided
    IF NEW.organizationId IS NOT NULL AND NEW.organization_id IS NULL THEN
        NEW.organization_id := NEW.organizationId;
    END IF;
    
    -- Ensure organizationId is set if organization_id is provided
    IF NEW.organization_id IS NOT NULL AND NEW.organizationId IS NULL THEN
        NEW.organizationId := NEW.organization_id;
    END IF;
    
    -- Ensure address, city, and state are not null
    NEW.address := COALESCE(NEW.address, '');
    NEW.city := COALESCE(NEW.city, '');
    NEW.state := COALESCE(NEW.state, '');
    
    -- Return the modified record
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on locations table
DROP TRIGGER IF EXISTS location_data_validation ON locations;
CREATE TRIGGER location_data_validation
BEFORE INSERT OR UPDATE ON locations
FOR EACH ROW
EXECUTE FUNCTION validate_location_data(); 