-- Organizations table
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  "contactEmail" TEXT,
  "contactPhone" TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  "zipCode" TEXT,
  country TEXT,
  website TEXT,
  "businessHours" TEXT
);

-- Locations table
CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "organizationId" UUID REFERENCES organizations(id),
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  state TEXT,
  "zipCode" TEXT,
  "isActive" BOOLEAN DEFAULT TRUE
);

-- Employees table
CREATE TABLE employees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "organizationId" UUID REFERENCES organizations(id),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL,
  phone TEXT,
  position TEXT,
  "hireDate" DATE,
  address TEXT,
  "emergencyContact" TEXT,
  notes TEXT,
  avatar TEXT,
  "hourlyRate" NUMERIC,
  status TEXT NOT NULL,
  "isOnline" BOOLEAN DEFAULT FALSE,
  "lastActive" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Shifts table
CREATE TABLE shifts (
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
CREATE TABLE shift_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "shiftId" UUID REFERENCES shifts(id),
  "employeeId" UUID REFERENCES employees(id),
  role TEXT,
  notes TEXT
);

-- Notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId" UUID NOT NULL,
  "organizationId" UUID REFERENCES organizations(id),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  "isRead" BOOLEAN DEFAULT FALSE,
  "isActionRequired" BOOLEAN,
  "actionUrl" TEXT,
  "relatedEntityId" TEXT,
  "relatedEntityType" TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sample data for organizations
INSERT INTO organizations (id, name, description)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'Acme Corporation', 'A global enterprise with diverse operations'),
  ('22222222-2222-2222-2222-222222222222', 'Stark Industries', 'Leading technology innovator');

-- Sample data for locations
INSERT INTO locations (id, "organizationId", name, address, city, state)
VALUES 
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'Headquarters', '123 Main St', 'New York', 'NY'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', 'West Branch', '456 Pine Ave', 'Los Angeles', 'CA'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '22222222-2222-2222-2222-222222222222', 'Research Lab', '789 Tech Blvd', 'San Francisco', 'CA');

-- Sample data for employees
INSERT INTO employees (id, "organizationId", name, email, role, status, "isOnline")
VALUES 
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', '11111111-1111-1111-1111-111111111111', 'John Doe', 'john@example.com', 'Manager', 'Active', true),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '11111111-1111-1111-1111-111111111111', 'Jane Smith', 'jane@example.com', 'Employee', 'Active', false),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', '22222222-2222-2222-2222-222222222222', 'Robert Johnson', 'robert@example.com', 'Engineer', 'Active', true);

-- Sample data for shifts (schedules)
INSERT INTO shifts (id, start_time, end_time, organization_id, location_id, name, is_schedule)
VALUES 
  ('99999999-9999-9999-9999-999999999999', '2023-06-01 08:00:00+00', '2023-06-30 17:00:00+00', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'June Schedule', true);

-- Sample data for shifts (individual shifts)
INSERT INTO shifts (id, start_time, end_time, organization_id, location_id, user_id, parent_shift_id, name, position, status, is_schedule)
VALUES 
  ('88888888-8888-8888-8888-888888888888', '2023-06-01 08:00:00+00', '2023-06-01 17:00:00+00', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '99999999-9999-9999-9999-999999999999', 'Morning Shift', 'Cashier', 'scheduled', false),
  ('77777777-7777-7777-7777-777777777777', '2023-06-02 08:00:00+00', '2023-06-02 17:00:00+00', '11111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '99999999-9999-9999-9999-999999999999', 'Morning Shift', 'Cashier', 'scheduled', false);

-- Sample data for shift assignments
INSERT INTO shift_assignments (id, "shiftId", "employeeId", role)
VALUES 
  ('gggggggg-gggg-gggg-gggg-gggggggggggg', '88888888-8888-8888-8888-888888888888', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'Lead'),
  ('hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh', '77777777-7777-7777-7777-777777777777', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Associate');

-- Sample data for notifications
INSERT INTO notifications (id, "userId", "organizationId", type, title, message, "isRead")
VALUES 
  ('iiiiiiii-iiii-iiii-iiii-iiiiiiiiiiii', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '11111111-1111-1111-1111-111111111111', 'shift_update', 'Shift Changed', 'Your shift on June 1st has been updated', false),
  ('jjjjjjjj-jjjj-jjjj-jjjj-jjjjjjjjjjjj', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '11111111-1111-1111-1111-111111111111', 'shift_reminder', 'Shift Tomorrow', 'Reminder: You have a shift tomorrow', true); 