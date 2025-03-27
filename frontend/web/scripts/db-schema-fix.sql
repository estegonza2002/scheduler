-- Database schema standardization script
-- Standardize on snake_case naming convention

-- Check if the camelCase column exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'locations' 
        AND column_name = 'organizationId'
    ) THEN
        RAISE NOTICE 'The column "organizationId" does not exist in the locations table.';
        RETURN;
    END IF;
END $$;

-- Ensure all locations have both fields populated
UPDATE locations 
SET organization_id = "organizationId" 
WHERE organization_id IS NULL AND "organizationId" IS NOT NULL;

UPDATE locations 
SET "organizationId" = organization_id 
WHERE "organizationId" IS NULL AND organization_id IS NOT NULL;

-- Create a procedure to keep both fields synchronized during the transition
CREATE OR REPLACE FUNCTION sync_organization_id_fields()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        -- Sync from camelCase to snake_case if camelCase is provided
        IF NEW."organizationId" IS NOT NULL AND 
           (NEW.organization_id IS NULL OR NEW.organization_id != NEW."organizationId") THEN
            NEW.organization_id := NEW."organizationId";
        END IF;
        
        -- Sync from snake_case to camelCase if snake_case is provided
        IF NEW.organization_id IS NOT NULL AND 
           (NEW."organizationId" IS NULL OR NEW."organizationId" != NEW.organization_id) THEN
            NEW."organizationId" := NEW.organization_id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add the trigger to the locations table
DROP TRIGGER IF EXISTS sync_organization_id_trigger ON locations;
CREATE TRIGGER sync_organization_id_trigger
BEFORE INSERT OR UPDATE ON locations
FOR EACH ROW
EXECUTE FUNCTION sync_organization_id_fields();

-- Remove the NOT NULL constraint from the camelCase field
DO $$
BEGIN
    ALTER TABLE locations ALTER COLUMN "organizationId" DROP NOT NULL;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Could not drop NOT NULL constraint: %', SQLERRM;
END $$;

-- Create a plan to safely migrate away from the camelCase field
COMMENT ON COLUMN locations."organizationId" IS 'DEPRECATED: Use organization_id instead. This field will be removed in a future update.';

-- Add a comment on the snake_case field to indicate it's the standard
COMMENT ON COLUMN locations.organization_id IS 'The ID of the organization this location belongs to. This is the standardized field.'; 