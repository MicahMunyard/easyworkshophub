-- Add onboarding tracking columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS onboarding_step INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS onboarding_data JSONB DEFAULT '{}'::jsonb;

-- Add index for faster onboarding status checks
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding_completed ON profiles(onboarding_completed);

-- Add comment to explain the columns
COMMENT ON COLUMN profiles.onboarding_completed IS 'Whether the user has completed the initial onboarding wizard';
COMMENT ON COLUMN profiles.onboarding_step IS 'Current step in the onboarding process (0-7)';
COMMENT ON COLUMN profiles.onboarding_data IS 'Temporary data stored during onboarding process';