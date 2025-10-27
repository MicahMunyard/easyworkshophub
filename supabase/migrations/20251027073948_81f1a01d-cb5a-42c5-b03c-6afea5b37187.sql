-- Create table for storing user EzyParts credentials
CREATE TABLE IF NOT EXISTS public.user_ezyparts_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_account TEXT NOT NULL,
  customer_id TEXT NOT NULL,
  password TEXT NOT NULL,
  location_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.user_ezyparts_credentials ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own EzyParts credentials"
  ON public.user_ezyparts_credentials
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own EzyParts credentials"
  ON public.user_ezyparts_credentials
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own EzyParts credentials"
  ON public.user_ezyparts_credentials
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own EzyParts credentials"
  ON public.user_ezyparts_credentials
  FOR DELETE
  USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_user_ezyparts_credentials_updated_at
  BEFORE UPDATE ON public.user_ezyparts_credentials
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();