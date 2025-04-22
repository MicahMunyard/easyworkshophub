
-- Create function to check if a user has an active Facebook connection
CREATE OR REPLACE FUNCTION public.check_facebook_connection(user_id_param UUID)
RETURNS json AS $$
DECLARE
  result json;
BEGIN
  SELECT json_build_object(
    'has_connection', COUNT(*) > 0
  ) INTO result
  FROM social_connections
  WHERE user_id = user_id_param
  AND platform = 'facebook'
  AND status = 'active';
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Create function to update social connection status
CREATE OR REPLACE FUNCTION public.update_social_connection_status(platform_name TEXT, new_status TEXT)
RETURNS void AS $$
BEGIN
  UPDATE social_connections
  SET status = new_status
  WHERE platform = platform_name;
END;
$$ LANGUAGE plpgsql;

-- Create function to find demo conversations
CREATE OR REPLACE FUNCTION public.find_demo_conversations(user_id_param UUID)
RETURNS SETOF social_conversations AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM social_conversations
  WHERE user_id = user_id_param
  AND contact_name ILIKE '%Demo Contact%';
END;
$$ LANGUAGE plpgsql;

-- Create function to delete messages by conversation IDs
CREATE OR REPLACE FUNCTION public.delete_messages_by_conversation_ids(conversation_ids UUID[])
RETURNS void AS $$
BEGIN
  DELETE FROM social_messages
  WHERE conversation_id = ANY(conversation_ids);
END;
$$ LANGUAGE plpgsql;

-- Create function to delete conversations by IDs
CREATE OR REPLACE FUNCTION public.delete_conversations_by_ids(conversation_ids UUID[])
RETURNS void AS $$
BEGIN
  DELETE FROM social_conversations
  WHERE id = ANY(conversation_ids);
END;
$$ LANGUAGE plpgsql;
