-- Cleanup script for Supabase database
-- WARNING: This will delete ALL data from your tables
-- Make sure you want to do this before running!

-- Disable triggers to avoid foreign key constraint errors
SET session_replication_role = 'replica';

-- Clear all tables
TRUNCATE TABLE "shift_assignments" CASCADE;
TRUNCATE TABLE "shifts" CASCADE;
TRUNCATE TABLE "employees" CASCADE;
TRUNCATE TABLE "locations" CASCADE;
TRUNCATE TABLE "notifications" CASCADE;
TRUNCATE TABLE "organizations" CASCADE;

-- Reset sequences
ALTER SEQUENCE IF EXISTS shift_assignments_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS shifts_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS employees_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS locations_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS notifications_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS organizations_id_seq RESTART WITH 1;

-- Re-enable triggers
SET session_replication_role = 'origin';

-- To remove all user accounts, you need to go to Authentication > Users in the Supabase dashboard
-- And delete users manually, or use the Supabase Management API
-- This SQL script only clears the application data

-- Verify tables are cleared
SELECT table_name, COUNT(*) FROM (
  SELECT 'shift_assignments' as table_name, COUNT(*) as count FROM shift_assignments
  UNION ALL
  SELECT 'shifts', COUNT(*) FROM shifts
  UNION ALL
  SELECT 'employees', COUNT(*) FROM employees
  UNION ALL
  SELECT 'locations', COUNT(*) FROM locations
  UNION ALL
  SELECT 'notifications', COUNT(*) FROM notifications
  UNION ALL
  SELECT 'organizations', COUNT(*) FROM organizations
) as counts
GROUP BY table_name
ORDER BY table_name; 