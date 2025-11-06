-- Enable pg_net extension for HTTP requests from database
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Update the handle_new_user function to properly use pg_net with error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  approval_required boolean;
  approval_token text;
  token_expires_at timestamp with time zone;
  http_request_id bigint;
BEGIN
  -- Check if account approval is required
  approval_required := coalesce(
    (SELECT (setting_value->>'enabled')::boolean 
     FROM public.system_settings 
     WHERE setting_key = 'require_account_approval'),
    true
  );

  -- Insert profile (this should always succeed)
  INSERT INTO public.profiles (
    user_id,
    full_name,
    username,
    account_status,
    approved_at,
    onboarding_data
  )
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'username',
    CASE WHEN approval_required THEN 'pending_approval' ELSE 'approved' END,
    CASE WHEN approval_required THEN null ELSE now() END,
    '{}'::jsonb
  );

  -- If approval is required, generate token and attempt to send notification
  IF approval_required THEN
    -- Generate secure token
    approval_token := gen_random_uuid()::text;
    token_expires_at := now() + INTERVAL '7 days';

    -- Store token (this should always succeed)
    INSERT INTO public.account_approval_tokens (
      user_id,
      token,
      expires_at
    ) VALUES (
      new.id,
      approval_token,
      token_expires_at
    );

    -- Attempt to send notification email via edge function using pg_net
    -- Wrapped in BEGIN/EXCEPTION to prevent signup failure if email fails
    BEGIN
      SELECT net.http_post(
        url := 'https://qyjjbpyqxwrluhymvshn.supabase.co/functions/v1/send-approval-notification',
        headers := jsonb_build_object(
          'Content-Type', 'application/json'
        ),
        body := jsonb_build_object(
          'userId', new.id::text,
          'email', new.email,
          'fullName', new.raw_user_meta_data->>'full_name',
          'workshopName', new.raw_user_meta_data->>'workshop_name',
          'token', approval_token,
          'expiresAt', token_expires_at::text
        )
      ) INTO http_request_id;
      
      -- Log success
      RAISE NOTICE 'Approval notification queued with request_id: %', http_request_id;
    EXCEPTION WHEN OTHERS THEN
      -- Log the error but don't fail the user creation
      RAISE WARNING 'Failed to send approval notification for user %: %', new.id, SQLERRM;
    END;
  END IF;
  
  RETURN new;
END;
$function$;