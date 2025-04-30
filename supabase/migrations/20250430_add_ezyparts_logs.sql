
-- Add EzyParts action logs table
CREATE TABLE IF NOT EXISTS public.ezyparts_action_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  action TEXT NOT NULL,
  data JSONB,
  environment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for the logs table
ALTER TABLE public.ezyparts_action_logs ENABLE ROW LEVEL SECURITY;

-- Allow users to insert their own logs
CREATE POLICY "Users can insert their own logs" 
  ON public.ezyparts_action_logs 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Allow users to view their own logs
CREATE POLICY "Users can view their own logs" 
  ON public.ezyparts_action_logs 
  FOR SELECT 
  USING (auth.uid() = user_id OR user_id IS NULL);
