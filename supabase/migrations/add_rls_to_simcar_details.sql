-- Enable RLS for simcar_details
ALTER TABLE simcar_details ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view all details
CREATE POLICY "Allow authenticated users to view simcar_details"
ON simcar_details FOR SELECT
TO authenticated
USING (true);

-- Allow authenticated users to insert details
CREATE POLICY "Allow authenticated users to insert simcar_details"
ON simcar_details FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow authenticated users to update details
CREATE POLICY "Allow authenticated users to update simcar_details"
ON simcar_details FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);
