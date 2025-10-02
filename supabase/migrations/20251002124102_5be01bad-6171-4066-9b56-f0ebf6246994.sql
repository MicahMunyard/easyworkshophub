-- Drop the existing function
DROP FUNCTION IF EXISTS check_facebook_connection(UUID);

-- Create function to check if user has an active Facebook connection
CREATE OR REPLACE FUNCTION check_facebook_connection(user_id_param UUID)
RETURNS TABLE (has_connection BOOLEAN)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT EXISTS(
    SELECT 1 
    FROM social_connections 
    WHERE user_id = user_id_param 
      AND platform = 'facebook' 
      AND status = 'active'
  ) as has_connection;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION check_facebook_connection(UUID) TO authenticated;