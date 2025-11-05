-- Create account_approval_tokens table for secure, one-time approval links
CREATE TABLE IF NOT EXISTS public.account_approval_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  token TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN NOT NULL DEFAULT false,
  used_at TIMESTAMP WITH TIME ZONE,
  approved_by_ip TEXT
);

-- Create index for fast token lookups
CREATE INDEX IF NOT EXISTS idx_approval_tokens_token ON public.account_approval_tokens(token);
CREATE INDEX IF NOT EXISTS idx_approval_tokens_user_id ON public.account_approval_tokens(user_id);

-- Enable RLS
ALTER TABLE public.account_approval_tokens ENABLE ROW LEVEL SECURITY;

-- RLS policies - only service role should access these tokens
CREATE POLICY "Service role can manage approval tokens"
  ON public.account_approval_tokens
  FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- Update handle_new_user function to generate approval token and send notification
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  approval_required boolean;
  approval_token text;
  token_expires_at timestamp with time zone;
BEGIN
  -- Check if account approval is required
  approval_required := coalesce(
    (SELECT (setting_value->>'enabled')::boolean 
     FROM public.system_settings 
     WHERE setting_key = 'require_account_approval'),
    true  -- default to requiring approval if setting doesn't exist
  );

  -- Insert profile
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

  -- If approval is required, generate token and send notification
  IF approval_required THEN
    -- Generate secure token
    approval_token := gen_random_uuid()::text;
    token_expires_at := now() + INTERVAL '7 days';

    -- Store token
    INSERT INTO public.account_approval_tokens (
      user_id,
      token,
      expires_at
    ) VALUES (
      new.id,
      approval_token,
      token_expires_at
    );

    -- Send notification email via edge function using pg_net
    -- Note: This requires the pg_net extension and proper configuration
    PERFORM net.http_post(
      url := 'https://qyjjbpyqxwrluhymvshn.supabase.co/functions/v1/send-approval-notification',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
      ),
      body := jsonb_build_object(
        'userId', new.id::text,
        'email', new.email,
        'fullName', new.raw_user_meta_data->>'full_name',
        'workshopName', new.raw_user_meta_data->>'workshop_name',
        'token', approval_token,
        'expiresAt', token_expires_at::text
      )
    );
  END IF;
  
  RETURN new;
END;
$$;