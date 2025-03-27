-- Organizations table
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  country TEXT,
  website TEXT,
  business_hours TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Locations table
CREATE TABLE IF NOT EXISTS locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id),
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Employees table
CREATE TABLE IF NOT EXISTS employees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL,
  phone TEXT,
  position TEXT,
  hire_date DATE,
  address TEXT,
  emergency_contact TEXT,
  notes TEXT,
  avatar TEXT,
  hourly_rate NUMERIC,
  status TEXT NOT NULL,
  is_online BOOLEAN DEFAULT FALSE,
  last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Shifts table
CREATE TABLE IF NOT EXISTS shifts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  organization_id UUID REFERENCES organizations(id),
  user_id UUID,
  created_by UUID,
  location_id UUID REFERENCES locations(id),
  parent_shift_id UUID REFERENCES shifts(id),
  name TEXT,
  description TEXT,
  position TEXT,
  status TEXT,
  is_schedule BOOLEAN NOT NULL,
  check_in_tasks JSONB,
  check_out_tasks JSONB
);

-- Shift Assignments table
CREATE TABLE IF NOT EXISTS shift_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shift_id UUID REFERENCES shifts(id),
  employee_id UUID REFERENCES employees(id),
  role TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  organization_id UUID REFERENCES organizations(id),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  is_action_required BOOLEAN,
  action_url TEXT,
  related_entity_id TEXT,
  related_entity_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sample data for organizations
INSERT INTO organizations (id, name, description, created_at, updated_at)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'Acme Corporation', 'A global enterprise with diverse operations', NOW(), NOW()),
  ('22222222-2222-2222-2222-222222222222', 'Stark Industries', 'Leading technology innovator', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Sample data for locations
INSERT INTO locations (id, organization_id, name, address, city, state, zip_code, created_at, updated_at)
VALUES 
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'Headquarters', '123 Main St', 'New York', 'NY', '10001', NOW(), NOW()),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', 'West Branch', '456 Pine Ave', 'Los Angeles', 'CA', '90001', NOW(), NOW()),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '22222222-2222-2222-2222-222222222222', 'Research Lab', '789 Tech Blvd', 'San Francisco', 'CA', '94101', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Sample data for employees
INSERT INTO employees (id, organization_id, name, email, role, status, is_online, created_at, updated_at)
VALUES 
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', '11111111-1111-1111-1111-111111111111', 'John Doe', 'john@example.com', 'Manager', 'Active', true, NOW(), NOW()),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '11111111-1111-1111-1111-111111111111', 'Jane Smith', 'jane@example.com', 'Employee', 'Active', false, NOW(), NOW()),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', '22222222-2222-2222-2222-222222222222', 'Robert Johnson', 'robert@example.com', 'Engineer', 'Active', true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Sample data for shifts (schedules)
INSERT INTO shifts (id, start_time, end_time, organization_id, location_id, name, is_schedule, created_at, updated_at)
VALUES 
  ('99999999-9999-9999-9999-999999999999', '2023-06-01 08:00:00+00', '2023-06-30 17:00:00+00', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'June Schedule', true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Sample data for shifts (individual shifts)
INSERT INTO shifts (id, start_time, end_time, organization_id, location_id, user_id, parent_shift_id, name, position, status, is_schedule, created_at, updated_at)
VALUES 
  ('88888888-8888-8888-8888-888888888888', '2023-06-01 08:00:00+00', '2023-06-01 17:00:00+00', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '99999999-9999-9999-9999-999999999999', 'Morning Shift', 'Cashier', 'scheduled', false, NOW(), NOW()),
  ('77777777-7777-7777-7777-777777777777', '2023-06-02 08:00:00+00', '2023-06-02 17:00:00+00', '11111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '99999999-9999-9999-9999-999999999999', 'Morning Shift', 'Cashier', 'scheduled', false, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Sample data for shift assignments
INSERT INTO shift_assignments (id, shift_id, employee_id, role, created_at, updated_at)
VALUES 
  ('gggggggg-gggg-gggg-gggg-gggggggggggg', '88888888-8888-8888-8888-888888888888', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'Lead', NOW(), NOW()),
  ('hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh', '77777777-7777-7777-7777-777777777777', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Associate', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Sample data for notifications
INSERT INTO notifications (id, user_id, organization_id, type, title, message, is_read, created_at)
VALUES 
  ('iiiiiiii-iiii-iiii-iiii-iiiiiiiiiiii', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '11111111-1111-1111-1111-111111111111', 'shift_update', 'Shift Changed', 'Your shift on June 1st has been updated', false, NOW()),
  ('jjjjjjjj-jjjj-jjjj-jjjj-jjjjjjjjjjjj', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '11111111-1111-1111-1111-111111111111', 'shift_reminder', 'Shift Tomorrow', 'Reminder: You have a shift tomorrow', true, NOW())
ON CONFLICT (id) DO NOTHING; 