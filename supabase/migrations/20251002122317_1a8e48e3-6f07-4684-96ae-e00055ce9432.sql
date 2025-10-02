-- Create social_connections table for storing Facebook page connections
CREATE TABLE IF NOT EXISTS public.social_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('facebook', 'instagram', 'tiktok')),
  page_id TEXT,
  page_name TEXT,
  page_access_token TEXT,
  user_access_token TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'disconnected', 'expired')),
  connected_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, page_id, platform)
);

-- Create facebook_page_tokens table for storing page access tokens
CREATE TABLE IF NOT EXISTS public.facebook_page_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  page_id TEXT NOT NULL,
  page_name TEXT NOT NULL,
  access_token TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, page_id)
);

-- Enable RLS on both tables
ALTER TABLE public.social_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facebook_page_tokens ENABLE ROW LEVEL SECURITY;

-- RLS policies for social_connections
CREATE POLICY "Users can view their own social connections"
  ON public.social_connections
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own social connections"
  ON public.social_connections
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own social connections"
  ON public.social_connections
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own social connections"
  ON public.social_connections
  FOR DELETE
  USING (auth.uid() = user_id);

-- RLS policies for facebook_page_tokens
CREATE POLICY "Users can view their own page tokens"
  ON public.facebook_page_tokens
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own page tokens"
  ON public.facebook_page_tokens
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own page tokens"
  ON public.facebook_page_tokens
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own page tokens"
  ON public.facebook_page_tokens
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_social_connections_user_id ON public.social_connections(user_id);
CREATE INDEX idx_social_connections_page_id ON public.social_connections(page_id);
CREATE INDEX idx_social_connections_platform ON public.social_connections(platform);
CREATE INDEX idx_facebook_page_tokens_user_id ON public.facebook_page_tokens(user_id);
CREATE INDEX idx_facebook_page_tokens_page_id ON public.facebook_page_tokens(page_id);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_social_connections_updated_at BEFORE UPDATE ON public.social_connections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_facebook_page_tokens_updated_at BEFORE UPDATE ON public.facebook_page_tokens
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();