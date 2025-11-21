-- Allow users to view unlinked oil dispensary data for validation
CREATE POLICY "Users can view unlinked oil dispensary data for validation"
ON oil_dispensary_data
FOR SELECT
USING (user_id IS NULL);