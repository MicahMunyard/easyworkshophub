import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';
import { corsHeaders } from '../_shared/cors.ts';

interface OilDispensaryPayload {
  bench_id?: string;
  oil_type?: string;
  current_level?: number;
  capacity?: number;
  unit?: string;
  timestamp?: string;
  [key: string]: any; // Allow additional fields
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Only accept POST requests
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Method not allowed. Please use POST.' 
        }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Validate webhook secret from header
    const webhookSecret = req.headers.get('x-webhook-secret');
    const expectedSecret = Deno.env.get('OIL_DISPENSARY_WEBHOOK_SECRET');

    if (!webhookSecret || webhookSecret !== expectedSecret) {
      const sourceIp = req.headers.get('x-forwarded-for') || 
                       req.headers.get('x-real-ip') || 
                       'unknown';
      
      console.warn('Unauthorized webhook attempt:', {
        sourceIp,
        hasSecret: !!webhookSecret,
        timestamp: new Date().toISOString()
      });
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Unauthorized. Invalid or missing webhook secret.' 
        }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get request metadata
    const sourceIp = req.headers.get('x-forwarded-for') || 
                     req.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    // Parse request body
    const payload: OilDispensaryPayload = await req.json();

    console.log('Oil dispensary webhook received (authenticated):', {
      sourceIp,
      userAgent,
      payloadKeys: Object.keys(payload),
      timestamp: new Date().toISOString()
    });

    // Initialize Supabase client with service role for inserting
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Extract common fields if they exist
    const {
      bench_id,
      oil_type,
      current_level,
      capacity,
      unit,
      timestamp,
      ...rest
    } = payload;

    // Prepare data for insertion
    const insertData = {
      bench_id: bench_id || null,
      raw_payload: payload,
      oil_type: oil_type || null,
      current_level: current_level !== undefined ? current_level : null,
      capacity: capacity !== undefined ? capacity : null,
      unit: unit || null,
      timestamp: timestamp ? new Date(timestamp).toISOString() : null,
      source_ip: sourceIp,
      user_id: null, // Will be mapped later when we know which user owns this bench
      processed: false
    };

    // Insert into database
    const { data, error } = await supabase
      .from('oil_dispensary_data')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('Error inserting oil dispensary data:', error);
      throw error;
    }

    console.log('Oil dispensary data stored successfully:', {
      recordId: data.id,
      bench_id: data.bench_id,
      receivedAt: data.received_at
    });

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Oil dispensary data received and stored',
        recordId: data.id,
        receivedAt: data.received_at,
        fieldsDetected: Object.keys(payload),
        bench_id: bench_id || 'not provided'
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in oil-dispensary-webhook:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
