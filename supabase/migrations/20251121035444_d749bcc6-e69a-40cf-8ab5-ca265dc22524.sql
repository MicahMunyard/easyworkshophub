-- Add bench_id column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS oil_bench_id TEXT;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_profiles_oil_bench_id ON profiles(oil_bench_id);

-- Create index on oil_dispensary_data for faster queries
CREATE INDEX IF NOT EXISTS idx_oil_dispensary_bench_user 
ON oil_dispensary_data(bench_id, user_id, timestamp DESC);

-- Update RLS policy to allow users to view their linked oil dispensary data
DROP POLICY IF EXISTS "Users can view their linked oil dispensary data" ON oil_dispensary_data;

CREATE POLICY "Users can view their linked oil dispensary data"
ON oil_dispensary_data FOR SELECT
USING (auth.uid() = user_id);