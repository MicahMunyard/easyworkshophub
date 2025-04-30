
-- Add EzyParts quotes table for saving vehicle quotes
CREATE TABLE IF NOT EXISTS public.ezyparts_quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  quote_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS policies for the quotes table
ALTER TABLE public.ezyparts_quotes ENABLE ROW LEVEL SECURITY;

-- Allow users to insert their own quotes
CREATE POLICY "Users can insert their own quotes" 
  ON public.ezyparts_quotes 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Allow users to view their own quotes
CREATE POLICY "Users can view their own quotes" 
  ON public.ezyparts_quotes 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Allow users to delete their own quotes
CREATE POLICY "Users can delete their own quotes" 
  ON public.ezyparts_quotes 
  FOR DELETE 
  USING (auth.uid() = user_id);
