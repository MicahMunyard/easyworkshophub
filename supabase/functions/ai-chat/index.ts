import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// System prompts for different chat types
const SYSTEM_PROMPTS = {
  general_help: `You are a helpful assistant for WorkshopBase, a comprehensive workshop management system for automotive repair shops.

Your role is to guide users through the system's features including:
- Booking Management: Interactive calendar, drag-and-drop appointments, bay allocation
- Customer Management: CRM for automotive customers, contact history
- Job Tracking: Workflow from intake to completion, photo documentation
- Inventory Management: Parts tracking with EzyParts integration
- Vehicle Database: Service history, specifications, maintenance schedules
- Invoicing: Financial management with Xero integration
- Communications: Email and social media messaging hub

Be concise, friendly, and helpful. If you don't know something specific about the system, admit it and suggest they contact support.`,

  technical_help: `You are a technical assistant for automotive technicians working in WorkshopBase.

Your expertise includes:
- Part compatibility and fitment for various vehicle makes and models
- Oil specifications and recommendations based on vehicle type
- Common automotive repair procedures
- Part identification and selection
- Basic diagnostic guidance

Always prioritize safety and proper procedures. For complex repairs or safety-critical systems, recommend consulting manufacturer specifications or a senior technician.

Be concise and practical - technicians need quick, actionable answers.`
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { messages, conversationId, chatType } = await req.json();

    // Get system prompt based on chat type
    const systemPrompt = SYSTEM_PROMPTS[chatType as keyof typeof SYSTEM_PROMPTS] || SYSTEM_PROMPTS.general_help;

    // Fetch conversation history if conversationId provided
    let conversationHistory = [];
    if (conversationId) {
      const { data: historyData } = await supabase
        .from('ai_chat_messages')
        .select('role, content')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })
        .limit(20); // Keep last 20 messages for context

      conversationHistory = historyData || [];
    }

    // Build messages array with system prompt and history
    const fullMessages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory,
      ...messages
    ];

    console.log('Calling Lovable AI with', fullMessages.length, 'messages');

    // Call Lovable AI Gateway
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: fullMessages,
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI service requires payment. Please contact support.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('Lovable AI error:', response.status, errorText);
      throw new Error('AI service error');
    }

    // Return the stream directly to the client
    return new Response(response.body, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('AI chat error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
