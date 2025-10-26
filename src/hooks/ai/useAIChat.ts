import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

type ChatType = 'general_help' | 'technical_help';

export type ChatContext = {
  currentPage?: string;
  vehicle?: {
    make?: string;
    model?: string;
    year?: string;
    vin?: string;
  };
  job?: {
    id?: string;
    service?: string;
    status?: string;
  };
};

export const useAIChat = (chatType: ChatType, context?: ChatContext) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const CHAT_URL = `https://qyjjbpyqxwrluhymvshn.supabase.co/functions/v1/ai-chat`;

  // Create new conversation
  const createConversation = async (technicianId?: string) => {
    const { data, error } = await supabase
      .from('ai_chat_conversations')
      .insert({
        user_id: user?.id,
        technician_id: technicianId,
        chat_type: chatType,
        title: `${chatType} - ${new Date().toLocaleDateString()}`,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating conversation:', error);
      return null;
    }

    return data.id;
  };

  // Save message to database
  const saveMessage = async (convId: string, role: 'user' | 'assistant', content: string) => {
    await supabase
      .from('ai_chat_messages')
      .insert({
        conversation_id: convId,
        role,
        content,
      });
  };

  const sendMessage = async (userMessage: string, technicianId?: string) => {
    if (!userMessage.trim()) return;

    // Add user message to UI
    const userMsg: Message = { role: 'user', content: userMessage };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      // Create conversation if needed
      let convId = conversationId;
      if (!convId) {
        convId = await createConversation(technicianId);
        if (convId) {
          setConversationId(convId);
        }
      }

      // Save user message
      if (convId) {
        await saveMessage(convId, 'user', userMessage);
      }

      // Call streaming endpoint with context
      const response = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF5ampicHlxeHdybHVoeW12c2huIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIyNzgwNjgsImV4cCI6MjA1Nzg1NDA2OH0.VByO7baQVLDg1782zsaSeigpByOgD3XizEzONNsVgtA`,
        },
        body: JSON.stringify({
          messages: [userMsg],
          conversationId: convId,
          chatType,
          context,
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error('Failed to get AI response');
      }

      // Process streaming response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantContent = '';
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              // Update assistant message in real-time
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === 'assistant') {
                  return prev.map((m, i) =>
                    i === prev.length - 1 ? { ...m, content: assistantContent } : m
                  );
                }
                return [...prev, { role: 'assistant', content: assistantContent }];
              });
            }
          } catch (e) {
            // Incomplete JSON, put back in buffer
            buffer = line + '\n' + buffer;
            break;
          }
        }
      }

      // Save assistant message
      if (convId && assistantContent) {
        await saveMessage(convId, 'assistant', assistantContent);
      }

    } catch (error) {
      console.error('Chat error:', error);
      toast({
        title: 'Error',
        description: 'Failed to get AI response. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setConversationId(null);
  };

  return {
    messages,
    isLoading,
    sendMessage,
    clearChat,
  };
};
