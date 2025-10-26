-- AI Chat Conversations Table
CREATE TABLE IF NOT EXISTS ai_chat_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  technician_id TEXT,
  chat_type TEXT NOT NULL CHECK (chat_type IN ('general_help', 'technical_help')),
  title TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Chat Messages Table
CREATE TABLE IF NOT EXISTS ai_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES ai_chat_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_ai_conversations_user ON ai_chat_conversations(user_id);
CREATE INDEX idx_ai_conversations_tech ON ai_chat_conversations(technician_id);
CREATE INDEX idx_ai_messages_conversation ON ai_chat_messages(conversation_id);

-- RLS Policies
ALTER TABLE ai_chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_chat_messages ENABLE ROW LEVEL SECURITY;

-- Users can see their own conversations
CREATE POLICY "Users can view own conversations"
  ON ai_chat_conversations FOR SELECT
  USING (auth.uid() = user_id OR technician_id IS NOT NULL);

-- Users can create their own conversations
CREATE POLICY "Users can create own conversations"
  ON ai_chat_conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id OR technician_id IS NOT NULL);

-- Users can view messages in their conversations
CREATE POLICY "Users can view own messages"
  ON ai_chat_messages FOR SELECT
  USING (
    conversation_id IN (
      SELECT id FROM ai_chat_conversations 
      WHERE user_id = auth.uid() OR technician_id IS NOT NULL
    )
  );

-- Users can create messages in their conversations
CREATE POLICY "Users can create own messages"
  ON ai_chat_messages FOR INSERT
  WITH CHECK (
    conversation_id IN (
      SELECT id FROM ai_chat_conversations 
      WHERE user_id = auth.uid() OR technician_id IS NOT NULL
    )
  );