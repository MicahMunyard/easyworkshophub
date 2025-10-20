-- Fix RLS security issues for newly created job_id_mapping table

-- Enable RLS on job_id_mapping table
ALTER TABLE job_id_mapping ENABLE ROW LEVEL SECURITY;

-- Create policy for job_id_mapping (only authenticated users can view their own mappings)
CREATE POLICY "Users can view their job mappings"
ON job_id_mapping
FOR SELECT
USING (
  new_booking_id IN (
    SELECT id FROM user_bookings WHERE user_id = auth.uid()
  )
);