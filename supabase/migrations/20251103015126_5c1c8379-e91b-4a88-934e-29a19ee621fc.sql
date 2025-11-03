-- Create email_signatures table
CREATE TABLE IF NOT EXISTS public.email_signatures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  html_content text NOT NULL,
  plain_text_content text NOT NULL,
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Only one default signature per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_one_default_signature_per_user 
ON public.email_signatures(user_id) 
WHERE is_default = true;

-- Enable RLS
ALTER TABLE public.email_signatures ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own signatures"
ON public.email_signatures FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own signatures"
ON public.email_signatures FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own signatures"
ON public.email_signatures FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own signatures"
ON public.email_signatures FOR DELETE
USING (auth.uid() = user_id);

-- Extend profiles table for professional email configuration
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email_display_name text,
ADD COLUMN IF NOT EXISTS email_reply_to text,
ADD COLUMN IF NOT EXISTS company_logo_url text,
ADD COLUMN IF NOT EXISTS company_website text,
ADD COLUMN IF NOT EXISTS company_address text;

-- Trigger for updated_at
CREATE TRIGGER update_email_signatures_updated_at
BEFORE UPDATE ON public.email_signatures
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();