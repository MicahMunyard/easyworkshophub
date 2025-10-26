-- Create function to automatically create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, workshop_name, username)
  VALUES (
    NEW.id,
    COALESCE(
      NULLIF(TRIM(COALESCE(NEW.raw_user_meta_data->>'first_name', '') || ' ' || COALESCE(NEW.raw_user_meta_data->>'last_name', '')), ''),
      'Workshop User'
    ),
    NEW.raw_user_meta_data->>'company_name',
    NEW.email
  );
  RETURN NEW;
END;
$$;

-- Create trigger that runs after user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Fix RLS policy for profile creation during signup
DROP POLICY IF EXISTS "Allow authenticated users to create their own profiles" ON public.profiles;

CREATE POLICY "Users can insert their own profile during signup"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = user_id);