-- This script clears all application data but preserves user accounts
-- Run these statements in order (from bottom to top of the hierarchy)

-- Clear notifications
DELETE FROM notifications;

-- Clear shift assignments
DELETE FROM shift_assignments;

-- Clear shifts
DELETE FROM shifts;

-- Clear employees (except your user)
-- Assuming your user has a specific ID, replace 'YOUR-USER-ID-HERE' with your actual user ID
DELETE FROM employees 
WHERE id != 'YOUR-USER-ID-HERE';

-- If you don't know your user ID, you can use your email instead:
-- DELETE FROM employees 
-- WHERE email != 'your-email@example.com';

-- Clear locations
DELETE FROM locations;

-- Clear organizations (except your user's organization)
-- If you know your organization ID, use this:
-- DELETE FROM organizations 
-- WHERE id != 'YOUR-ORGANIZATION-ID-HERE';

-- If you don't know your organization ID but know which one is yours by name:
-- DELETE FROM organizations 
-- WHERE name != 'Your Organization Name';

-- Alternatively, you can keep all organizations but delete all other data:
-- TRUNCATE TABLE notifications, shift_assignments, shifts, locations CASCADE;
-- DELETE FROM employees WHERE id != 'YOUR-USER-ID-HERE'; 