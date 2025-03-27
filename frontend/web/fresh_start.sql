-- WARNING: This will delete ALL data from all relevant tables
-- Make sure this is what you want before running it!

-- Disable foreign key checks for this session (Supabase uses PostgreSQL)
BEGIN;

-- Truncate all tables in reverse order of dependencies
TRUNCATE TABLE notifications CASCADE;
TRUNCATE TABLE shift_assignments CASCADE;
TRUNCATE TABLE shifts CASCADE;
TRUNCATE TABLE employees CASCADE;
TRUNCATE TABLE locations CASCADE;
TRUNCATE TABLE organizations CASCADE;

COMMIT; 