-- Fix the RLS policy for technicians creating parts requests
-- Remove the circular reference that was causing the policy to fail

DROP POLICY IF EXISTS "Technicians can create parts requests" ON job_parts_requests;

CREATE POLICY "Technicians can create parts requests"
ON job_parts_requests
FOR INSERT
TO authenticated
WITH CHECK (
  requested_by IN (
    SELECT id FROM user_technicians
  )
);