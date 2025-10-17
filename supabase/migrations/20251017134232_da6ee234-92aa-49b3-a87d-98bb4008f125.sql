-- Drop the old insecure function
DROP FUNCTION IF EXISTS public.update_social_connection_status(TEXT, TEXT);

-- Create new secure function with user_id parameter
CREATE OR REPLACE FUNCTION public.update_social_connection_status(
  platform_name TEXT, 
  new_status TEXT,
  user_id_param UUID
)
RETURNS void 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE social_connections
  SET status = new_status
  WHERE platform = platform_name 
    AND user_id = user_id_param;
END;
$$ LANGUAGE plpgsql;