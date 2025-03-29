-- Enable Row Level Security for shifts table
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view shifts in their organizations
CREATE POLICY "Users can view shifts in their organizations" 
ON shifts FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM organization_members
    WHERE organization_id = shifts.organization_id
    AND user_id = auth.uid()
  )
);

-- Policy: Users can insert shifts for their organizations
CREATE POLICY "Users can insert shifts in their organizations" 
ON shifts FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM organization_members
    WHERE organization_id = shifts.organization_id
    AND user_id = auth.uid()
  )
);

-- Policy: Users can update shifts for their organizations
CREATE POLICY "Users can update shifts in their organizations" 
ON shifts FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM organization_members
    WHERE organization_id = shifts.organization_id
    AND user_id = auth.uid()
  )
);

-- Policy: Users can delete shifts for their organizations
CREATE POLICY "Users can delete shifts in their organizations" 
ON shifts FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM organization_members
    WHERE organization_id = shifts.organization_id
    AND user_id = auth.uid()
  )
); 