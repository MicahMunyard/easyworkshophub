
// Database functions for technician authentication

/* 
We'll need these database functions to properly handle technician authentication:

1. Function to verify technician login (email/password)
2. Function to update the last login timestamp

SQL to create these functions:

CREATE OR REPLACE FUNCTION public.verify_technician_login(
  tech_email TEXT,
  tech_password TEXT,
  workshop_user_id UUID
) RETURNS json AS $$
DECLARE
  result json;
BEGIN
  SELECT json_build_object(
    'is_valid', CASE WHEN tl.password_hash = tech_password THEN true ELSE false END,
    'technician_id', ut.id
  ) INTO result
  FROM technician_logins tl
  JOIN user_technicians ut ON tl.technician_id = ut.id
  WHERE tl.email = tech_email
    AND ut.user_id = workshop_user_id;
  
  RETURN COALESCE(result, '{"is_valid": false, "technician_id": null}'::json);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.update_technician_last_login(
  tech_id UUID
) RETURNS void AS $$
BEGIN
  UPDATE technician_logins
  SET last_login = now()
  WHERE technician_id = tech_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
*/

