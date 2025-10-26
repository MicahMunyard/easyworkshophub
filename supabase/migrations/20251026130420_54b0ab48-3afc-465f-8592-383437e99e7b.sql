-- Analytics table for tracking chat questions
CREATE TABLE IF NOT EXISTS ai_chat_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES ai_chat_conversations(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  category TEXT,
  context_type TEXT, -- 'job', 'vehicle', 'inventory', 'general'
  context_data JSONB,
  response_time_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for analytics queries
CREATE INDEX idx_ai_analytics_user ON ai_chat_analytics(user_id);
CREATE INDEX idx_ai_analytics_category ON ai_chat_analytics(category);
CREATE INDEX idx_ai_analytics_context ON ai_chat_analytics(context_type);
CREATE INDEX idx_ai_analytics_created ON ai_chat_analytics(created_at);

-- RLS for analytics
ALTER TABLE ai_chat_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own analytics"
  ON ai_chat_analytics FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own analytics"
  ON ai_chat_analytics FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Function to get common questions
CREATE OR REPLACE FUNCTION get_common_questions(days_ago INTEGER DEFAULT 30, limit_count INTEGER DEFAULT 20)
RETURNS TABLE(question TEXT, count BIGINT, category TEXT)
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    question,
    COUNT(*) as count,
    category
  FROM ai_chat_analytics
  WHERE user_id = auth.uid()
    AND created_at > NOW() - INTERVAL '1 day' * days_ago
  GROUP BY question, category
  ORDER BY count DESC
  LIMIT limit_count;
$$;