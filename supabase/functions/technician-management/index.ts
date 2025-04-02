
// Technician management functions

/* 
Additional database functions needed for technician management:

CREATE OR REPLACE FUNCTION public.add_technician_login(
  tech_id UUID,
  tech_email TEXT,
  tech_password TEXT
) RETURNS void AS $$
BEGIN
  INSERT INTO technician_logins (technician_id, email, password_hash)
  VALUES (tech_id, tech_email, tech_password);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.update_technician_email(
  tech_id UUID,
  new_email TEXT
) RETURNS void AS $$
BEGIN
  UPDATE technician_logins
  SET email = new_email
  WHERE technician_id = tech_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
*/

