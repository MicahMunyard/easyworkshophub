-- Manually approve the stuck user
UPDATE profiles 
SET account_status = 'approved', 
    approved_at = NOW()
WHERE user_id = '66bb438a-5970-4043-967c-89c4fd48cdd6';

-- Create a function to manually approve users (for future use)
CREATE OR REPLACE FUNCTION approve_user(p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE profiles
  SET account_status = 'approved',
      approved_at = NOW()
  WHERE user_id = p_user_id
    AND account_status = 'pending_approval';
END;
$$;

COMMENT ON FUNCTION approve_user IS 'Manually approves a user account by setting status to approved';