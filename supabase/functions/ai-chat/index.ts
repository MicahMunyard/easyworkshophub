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

When users are on specific pages, proactively suggest relevant next steps.
Be concise, friendly, and helpful. If you don't know something specific about the system, admit it and suggest they contact support.`,

  technical_help: `You are a technical assistant for automotive technicians working in WorkshopBase.

Your expertise includes:
- Part compatibility and fitment for various vehicle makes and models
- Oil specifications and recommendations based on vehicle type
- Common automotive repair procedures
- Part identification and selection
- Basic diagnostic guidance

When vehicle information is provided, give vehicle-specific recommendations.
Use the search_inventory tool to find compatible parts when asked.
Always prioritize safety and proper procedures. For complex repairs or safety-critical systems, recommend consulting manufacturer specifications or a senior technician.

Be concise and practical - technicians need quick, actionable answers.`
};

// AI Tools for inventory search and suggestions
const AI_TOOLS = [
  {
    type: "function",
    function: {
      name: "search_inventory",
      description: "Search for parts in the workshop inventory. Use this when technicians ask about part availability or compatibility.",
      parameters: {
        type: "object",
        properties: {
          search_term: {
            type: "string",
            description: "Part name, code, or description to search for"
          },
          category: {
            type: "string",
            description: "Optional category filter (e.g., 'Brake Parts', 'Engine Parts')"
          }
        },
        required: ["search_term"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "suggest_next_steps",
      description: "Suggest proactive next steps based on current workflow context",
      parameters: {
        type: "object",
        properties: {
          current_context: {
            type: "string",
            description: "Current page or workflow the user is on"
          }
        },
        required: ["current_context"]
      }
    }
  }
];

// Helper function to search inventory
async function searchInventory(supabase: any, userId: string, searchTerm: string, category?: string) {
  let query = supabase
    .from('user_inventory_items')
    .select('id, code, name, description, category, in_stock, price, retail_price')
    .eq('user_id', userId)
    .gt('in_stock', 0);
  
  if (category) {
    query = query.eq('category', category);
  }
  
  if (searchTerm) {
    query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,code.ilike.%${searchTerm}%`);
  }
  
  const { data, error } = await query.limit(5);
  
  if (error) {
    console.error('Inventory search error:', error);
    return { items: [], error: error.message };
  }
  
  return { items: data || [], error: null };
}

// Helper function to get proactive suggestions
function getProactiveSuggestions(context: string, vehicleInfo?: any) {
  const suggestions: Record<string, string> = {
    'inventory': 'You can add new parts via the "Add Product" button, or import parts from EzyParts.',
    'job': 'Next steps: Assign technician → Request parts → Start timer → Upload photos → Complete job',
    'booking': 'After creating a booking, you can assign it to a technician and add service notes.',
    'customer': 'You can add vehicle information, view service history, or create a new booking for this customer.',
    'technician_portal': 'Start your shift by checking pending jobs, then select a job to begin work.'
  };
  
  return suggestions[context] || 'How can I help you with WorkshopBase today?';
}

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

    // Get auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Get user from auth header
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );
    
    if (authError || !user) {
      throw new Error('Authentication failed');
    }

    const { messages, conversationId, chatType, context } = await req.json();

    // Get system prompt based on chat type
    let systemPrompt = SYSTEM_PROMPTS[chatType as keyof typeof SYSTEM_PROMPTS] || SYSTEM_PROMPTS.general_help;
    
    // Add context to system prompt if provided
    if (context) {
      let contextAddition = '';
      
      if (context.currentPage) {
        contextAddition += `\n\nThe user is currently on the ${context.currentPage} page.`;
        const suggestion = getProactiveSuggestions(context.currentPage, context.vehicle);
        contextAddition += `\nProactive suggestion: ${suggestion}`;
      }
      
      if (context.vehicle) {
        contextAddition += `\n\nCurrent vehicle context: ${context.vehicle.year || ''} ${context.vehicle.make || ''} ${context.vehicle.model || ''}`;
        if (context.vehicle.vin) {
          contextAddition += ` (VIN: ${context.vehicle.vin})`;
        }
      }
      
      if (context.job) {
        contextAddition += `\n\nCurrent job: ${context.job.service || 'Unknown service'} - Status: ${context.job.status || 'pending'}`;
      }
      
      systemPrompt += contextAddition;
    }

    // Fetch conversation history if conversationId provided
    let conversationHistory = [];
    if (conversationId) {
      const { data: historyData } = await supabase
        .from('ai_chat_messages')
        .select('role, content')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })
        .limit(20);

      conversationHistory = historyData || [];
    }

    // Build messages array with system prompt and history
    const fullMessages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory,
      ...messages
    ];

    console.log('Calling Lovable AI with', fullMessages.length, 'messages', 'Context:', context);
    
    // Track analytics
    const startTime = Date.now();
    const userMessage = messages[messages.length - 1]?.content || '';

    // Call Lovable AI Gateway with tools
    const aiPayload: any = {
      model: 'google/gemini-2.5-flash',
      messages: fullMessages,
      stream: true,
    };
    
    // Add tools for technical help
    if (chatType === 'technical_help') {
      aiPayload.tools = AI_TOOLS;
      aiPayload.tool_choice = 'auto';
    }
    
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(aiPayload),
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

    // Process streaming response and handle tool calls
    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let fullResponse = '';
    let toolCalls: any[] = [];
    
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';
            
            for (const line of lines) {
              if (!line.trim() || line.startsWith(':')) continue;
              if (!line.startsWith('data: ')) continue;
              
              const data = line.slice(6);
              if (data === '[DONE]') continue;
              
              try {
                const parsed = JSON.parse(data);
                const delta = parsed.choices?.[0]?.delta;
                
                // Handle tool calls
                if (delta?.tool_calls) {
                  toolCalls.push(...delta.tool_calls);
                }
                
                // Handle content
                if (delta?.content) {
                  fullResponse += delta.content;
                }
                
                // Forward to client
                controller.enqueue(encoder.encode(`data: ${data}\n\n`));
              } catch (e) {
                console.error('Parse error:', e);
              }
            }
          }
          
          // Execute tool calls if any
          if (toolCalls.length > 0) {
            for (const toolCall of toolCalls) {
              if (toolCall.function?.name === 'search_inventory') {
                const args = JSON.parse(toolCall.function.arguments);
                const result = await searchInventory(
                  supabase,
                  user.id,
                  args.search_term,
                  args.category
                );
                
                const inventoryMessage = result.items.length > 0
                  ? `\n\nFound ${result.items.length} matching parts:\n${result.items.map((item: any) => 
                      `- ${item.name} (${item.code}) - In stock: ${item.in_stock} - Price: $${item.retail_price || item.price}`
                    ).join('\n')}`
                  : '\n\nNo matching parts found in inventory.';
                
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                  choices: [{ delta: { content: inventoryMessage } }]
                })}\n\n`));
              }
            }
          }
          
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          
          // Save analytics
          const responseTime = Date.now() - startTime;
          await supabase.from('ai_chat_analytics').insert({
            user_id: user.id,
            conversation_id: conversationId,
            question: userMessage,
            context_type: context?.currentPage || 'general',
            context_data: context || {},
            response_time_ms: responseTime
          });
          
          controller.close();
        } catch (error) {
          console.error('Stream error:', error);
          controller.error(error);
        }
      }
    });

    return new Response(stream, {
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
