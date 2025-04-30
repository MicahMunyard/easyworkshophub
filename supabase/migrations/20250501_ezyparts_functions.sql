
-- Create RPC functions for safer operations on the ezyparts tables
-- even when the client-side Supabase type definitions might be outdated

-- Function to log EzyParts actions
CREATE OR REPLACE FUNCTION public.log_ezyparts_action(
  p_action TEXT,
  p_data JSONB, 
  p_environment TEXT, 
  p_user_id UUID
) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.ezyparts_action_logs(
    action, 
    data, 
    environment, 
    user_id
  ) VALUES (
    p_action, 
    p_data, 
    p_environment, 
    p_user_id
  );
END;
$$;

-- Function to get a user's EzyParts quotes
CREATE OR REPLACE FUNCTION public.get_user_ezyparts_quotes()
RETURNS TABLE (
  id UUID,
  user_id UUID,
  quote_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  current_user_id UUID;
BEGIN
  current_user_id := auth.uid();
  
  RETURN QUERY 
  SELECT 
    eq.id,
    eq.user_id,
    eq.quote_data,
    eq.created_at,
    eq.updated_at
  FROM public.ezyparts_quotes eq
  WHERE eq.user_id = current_user_id
  ORDER BY eq.created_at DESC;
END;
$$;

-- Function to save an EzyParts quote
CREATE OR REPLACE FUNCTION public.save_ezyparts_quote(
  p_quote_data JSONB,
  p_user_id UUID
) RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  new_quote_id UUID;
BEGIN
  INSERT INTO public.ezyparts_quotes(
    user_id,
    quote_data
  ) VALUES (
    p_user_id,
    p_quote_data
  ) RETURNING id INTO new_quote_id;
  
  RETURN new_quote_id;
END;
$$;

-- Function to delete an EzyParts quote
CREATE OR REPLACE FUNCTION public.delete_ezyparts_quote(
  p_quote_id UUID,
  p_user_id UUID
) RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.ezyparts_quotes
  WHERE id = p_quote_id AND user_id = p_user_id
  RETURNING 1 INTO deleted_count;
  
  RETURN COALESCE(deleted_count, 0) > 0;
END;
$$;

-- Add comment mentioning these are EzyParts helper functions
COMMENT ON FUNCTION public.log_ezyparts_action IS 'Securely log EzyParts integration actions';
COMMENT ON FUNCTION public.get_user_ezyparts_quotes IS 'Get a user''s saved EzyParts quotes';
COMMENT ON FUNCTION public.save_ezyparts_quote IS 'Save an EzyParts quote for a user';
COMMENT ON FUNCTION public.delete_ezyparts_quote IS 'Delete a user''s EzyParts quote by ID';
