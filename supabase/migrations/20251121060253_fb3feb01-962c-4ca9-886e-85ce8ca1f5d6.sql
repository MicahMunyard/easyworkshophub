-- Allow users to link unlinked oil_dispensary_data to themselves
-- if the bench_id matches their profile's oil_bench_id
CREATE POLICY "Users can link unlinked oil dispensary data to themselves"
ON oil_dispensary_data
FOR UPDATE
TO authenticated
USING (
  user_id IS NULL 
  AND bench_id IN (
    SELECT oil_bench_id 
    FROM profiles 
    WHERE user_id = auth.uid()
    AND oil_bench_id IS NOT NULL
  )
)
WITH CHECK (
  user_id = auth.uid()
);