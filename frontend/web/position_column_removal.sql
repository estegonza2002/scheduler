-- Script to remove the position column from the shifts table
-- Run this in your Supabase SQL editor

-- First, make the column nullable (to prevent errors on existing data)
ALTER TABLE shifts ALTER COLUMN position DROP NOT NULL;

-- Next, add a default value for existing records
UPDATE shifts SET position = '' WHERE position IS NULL;

-- Finally, remove the column
ALTER TABLE shifts DROP COLUMN position;

-- Confirm the column is removed
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'shifts' 
ORDER BY ordinal_position; 