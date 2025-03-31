-- Migration script to rename role column to position in employees table

-- Step 1: Check if position column already exists and create it if it doesn't
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'employees' 
        AND column_name = 'position'
    ) THEN
        -- Add position column
        ALTER TABLE employees ADD COLUMN position text;
        
        -- Copy data from role to position
        UPDATE employees SET position = role;
    END IF;
END $$;

-- Step 2: Make sure position is not null where role is not null
UPDATE employees SET position = role WHERE position IS NULL AND role IS NOT NULL;

-- Step 3: Add default value for position if it's still null
UPDATE employees SET position = 'Employee' WHERE position IS NULL;

-- Step 4: Drop role column (only after ensuring data is migrated)
ALTER TABLE employees DROP COLUMN IF EXISTS role;

-- Step 5: Add any necessary constraints or indexes to position column
-- Uncomment the following if you want to make position required
-- ALTER TABLE employees ALTER COLUMN position SET NOT NULL;

-- Log migration completion
DO $$
BEGIN
    RAISE NOTICE 'Migration completed: role column renamed to position in employees table';
END $$;
