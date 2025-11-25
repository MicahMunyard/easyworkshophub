import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';
import { corsHeaders } from '../_shared/cors.ts';

interface OilDispensaryPayload {
  level?: number;
  device?: {
    label?: string;
    reference?: string;
  };
  sensor?: {
    label?: string;
    number?: number;
  };
  createdOn?: string;
  [key: string]: any; // Allow additional fields
}

Deno.serve(async (req) => {
  const startTime = Date.now();
  const requestId = crypto.randomUUID();

  // Log incoming request details
  console.log(`[${requestId}] === INCOMING REQUEST ===`, {
    requestId,
    method: req.method,
    url: req.url,
    headers: Object.fromEntries(req.headers.entries()),
    timestamp: new Date().toISOString()
  });

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    console.log(`[${requestId}] CORS preflight request`);
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Only accept POST requests
    if (req.method !== 'POST') {
      console.warn(`[${requestId}] Method not allowed:`, req.method);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Method not allowed. Please use POST.',
          requestId 
        }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get request metadata
    const sourceIp = req.headers.get('x-forwarded-for') || 
                     req.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    // Validate webhook secret from header
    const webhookSecret = req.headers.get('x-webhook-secret');
    const expectedSecret = Deno.env.get('OIL_DISPENSARY_WEBHOOK_SECRET');

    console.log(`[${requestId}] Authentication check:`, {
      hasSecretHeader: !!webhookSecret,
      secretLength: webhookSecret?.length || 0,
      expectedSecretConfigured: !!expectedSecret,
      secretsMatch: webhookSecret === expectedSecret,
      sourceIp,
      userAgent
    });

    if (!webhookSecret || webhookSecret !== expectedSecret) {
      console.warn(`[${requestId}] Unauthorized webhook attempt:`, {
        sourceIp,
        userAgent,
        hasSecret: !!webhookSecret,
        timestamp: new Date().toISOString()
      });
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Unauthorized. Invalid or missing webhook secret.',
          requestId 
        }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Read and log raw request body
    const rawBody = await req.text();
    console.log(`[${requestId}] Raw request body:`, rawBody);
    console.log(`[${requestId}] Raw body length:`, rawBody.length);

    // Parse request body
    let payload: OilDispensaryPayload;
    try {
      payload = JSON.parse(rawBody);
      console.log(`[${requestId}] Parsed payload:`, payload);
    } catch (parseError) {
      console.error(`[${requestId}] JSON parse error:`, {
        error: parseError instanceof Error ? parseError.message : String(parseError),
        rawBody: rawBody.substring(0, 500) // Log first 500 chars
      });
      throw new Error(`Invalid JSON payload: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
    }


    console.log(`[${requestId}] Oil dispensary webhook authenticated successfully:`, {
      sourceIp,
      userAgent,
      payloadKeys: Object.keys(payload),
      timestamp: new Date().toISOString()
    });

    // Initialize Supabase client with service role for inserting
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Extract fields from nested structure
    const currentLevel = payload.level;
    const benchId = payload.device?.label || payload.device?.reference;
    const oilType = payload.sensor?.label;
    const sensorNumber = payload.sensor?.number;
    const timestamp = payload.createdOn;

    console.log(`[${requestId}] Extracted data:`, {
      benchId,
      oilType,
      sensorNumber,
      currentLevel,
      timestamp,
      hasDevice: !!payload.device,
      hasSensor: !!payload.sensor,
      deviceLabel: payload.device?.label,
      deviceReference: payload.device?.reference
    });

    // Build a descriptive oil_type that includes sensor number if available
    const fullOilType = sensorNumber 
      ? `${oilType} (Sensor ${sensorNumber})`
      : oilType;

    // Prepare data for insertion
    const insertData = {
      bench_id: benchId || null,
      raw_payload: payload,
      oil_type: fullOilType || null,
      current_level: currentLevel !== undefined ? currentLevel : null,
      capacity: null, // Not provided in payload
      unit: 'liters', // Default unit
      timestamp: timestamp ? new Date(timestamp).toISOString() : null,
      source_ip: sourceIp,
      user_id: null, // Will be mapped later when we know which user owns this bench
      processed: false
    };

    console.log(`[${requestId}] Inserting into database:`, {
      ...insertData,
      raw_payload: '[INCLUDED]' // Don't double-log the payload
    });


    // Insert into database
    const { data, error } = await supabase
      .from('oil_dispensary_data')
      .insert(insertData)
      .select()
      .single();

    console.log(`[${requestId}] Database operation result:`, {
      success: !error,
      recordId: data?.id,
      hasError: !!error,
      errorCode: error?.code,
      errorMessage: error?.message,
      errorDetails: error?.details
    });

    if (error) {
      console.error(`[${requestId}] Error inserting oil dispensary data:`, {
        error,
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      throw error;
    }


    // Try to link this data to a user based on bench_id
    if (benchId && data?.id) {
      console.log(`[${requestId}] Attempting to link data to user with bench_id:`, benchId);
      
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('user_id')
          .eq('oil_bench_id', benchId)
          .maybeSingle();
        
        console.log(`[${requestId}] Profile lookup result:`, {
          foundProfile: !!profile,
          userId: profile?.user_id
        });

        if (profile?.user_id) {
          const { error: updateError } = await supabase
            .from('oil_dispensary_data')
            .update({ user_id: profile.user_id, processed: true })
            .eq('id', data.id);
          
          if (updateError) {
            console.error(`[${requestId}] Error updating user_id:`, updateError);
          } else {
            console.log(`[${requestId}] Successfully linked data to user:`, profile.user_id);
          }
        } else {
          console.log(`[${requestId}] No user found with bench_id:`, benchId);
        }
      } catch (linkError) {
        console.error(`[${requestId}] Error linking to user:`, {
          error: linkError,
          message: linkError instanceof Error ? linkError.message : String(linkError),
          stack: linkError instanceof Error ? linkError.stack : undefined
        });
        // Don't fail the request if linking fails
      }
    }


    const duration = Date.now() - startTime;
    
    console.log(`[${requestId}] Oil dispensary data stored successfully:`, {
      recordId: data.id,
      bench_id: data.bench_id,
      oil_type: data.oil_type,
      current_level: data.current_level,
      sensor_number: sensorNumber,
      receivedAt: data.received_at,
      duration: `${duration}ms`
    });

    const successResponse = {
      success: true,
      message: 'Oil dispensary data received and stored',
      requestId,
      recordId: data.id,
      receivedAt: data.received_at,
      bench_id: benchId || 'not provided',
      oil_type: fullOilType || 'not provided',
      current_level: currentLevel,
      processingTime: `${duration}ms`
    };

    console.log(`[${requestId}] === SENDING SUCCESS RESPONSE ===`, {
      status: 200,
      duration: `${duration}ms`,
      recordId: data.id
    });

    // Return success response
    return new Response(
      JSON.stringify(successResponse),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );


  } catch (error) {
    const duration = Date.now() - startTime;
    
    console.error(`[${requestId}] === ERROR ===`, {
      requestId,
      errorMessage: error instanceof Error ? error.message : String(error),
      errorStack: error instanceof Error ? error.stack : undefined,
      errorType: error?.constructor?.name,
      errorDetails: error,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString()
    });
    
    const errorResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      requestId,
      timestamp: new Date().toISOString(),
      processingTime: `${duration}ms`
    };

    console.log(`[${requestId}] === SENDING ERROR RESPONSE ===`, {
      status: 500,
      duration: `${duration}ms`
    });

    return new Response(
      JSON.stringify(errorResponse),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
