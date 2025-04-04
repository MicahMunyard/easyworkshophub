
-- Create a table to store Facebook page tokens
CREATE TABLE IF NOT EXISTS public.facebook_page_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  page_id VARCHAR NOT NULL,
  page_name VARCHAR NOT NULL,
  access_token TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, page_id)
);

-- Add a trigger to update the updated_at column
CREATE TRIGGER update_facebook_page_tokens_updated_at
BEFORE UPDATE ON public.facebook_page_tokens
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Set up RLS policies for facebook_page_tokens
ALTER TABLE public.facebook_page_tokens ENABLE ROW LEVEL SECURITY;

-- Create policies for facebook_page_tokens
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

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_facebook_page_tokens_user_id ON public.facebook_page_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_facebook_page_tokens_page_id ON public.facebook_page_tokens(page_id);
