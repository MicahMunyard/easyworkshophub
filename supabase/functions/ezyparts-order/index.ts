
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface OrderSubmissionRequest {
  inputMetaData: {
    checkCurrentPosition: boolean;
  };
  headers: {
    customerAccount: string;
    customerId: string;
    password: string;
    locationId?: string;
    locationName?: string;
    customerName: string;
    customerAddress: string;
    customerSuburb?: string;
    purchaseOrderNumber?: string;
    dateServed: string;
    repId?: string;
    encryptedVehicleId?: number;
    rego?: string;
    make?: string;
    model?: string;
    deliveryType: string;
    note?: string;
    host?: string;
    userAgent?: string;
    salesOrderSalesAuditList?: Array<{
      salesAuditFieldNumber: string;
      salesAuditValue: string;
    }>;
  };
  parts: Array<{
    qty: number;
    sku: string;
    nettPriceEach: number;
    retailPriceEa?: number;
  }>;
}

interface OrderSubmissionResponse {
  failOrderLines: Array<{
    qty: number;
    sku: string;
    nettPriceEach: number;
    retailPriceEa: number;
    reason: string;
  }>;
  headers: any;
  successOrderLines: Array<{
    qty: number;
    sku: string;
  }>;
  salesOrderNumber: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const { user_id, order_data } = await req.json();

    if (!user_id || !order_data) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Get EzyParts credentials from Supabase secrets
    const clientId = Deno.env.get('EZYPARTS_CLIENT_ID');
    const clientSecret = Deno.env.get('EZYPARTS_CLIENT_SECRET');
    const accountId = Deno.env.get('EZYPARTS_ACCOUNT_ID');
    const username = Deno.env.get('EZYPARTS_USERNAME');
    const password = Deno.env.get('EZYPARTS_PASSWORD');
    const isProduction = Deno.env.get('EZYPARTS_ENVIRONMENT') === 'production';

    if (!clientId || !clientSecret || !accountId || !username || !password) {
      console.error('Missing EzyParts credentials');
      return new Response(
        JSON.stringify({ error: 'EzyParts integration not configured' }),
        { status: 500, headers: corsHeaders }
      );
    }

    // First, get OAuth token
    const authUrl = isProduction 
      ? 'https://api.ezyparts.burson.com.au/authorizationserver/oauth/token'
      : 'https://api.ezypartsqa.burson.com.au/authorizationserver/oauth/token';

    const authParams = new URLSearchParams();
    authParams.append('grant_type', 'client_credentials');
    authParams.append('client_id', clientId);
    authParams.append('client_secret', clientSecret);

    console.log('Getting OAuth token for order submission...');

    const authResponse = await fetch(authUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: authParams.toString()
    });

    if (!authResponse.ok) {
      console.error('Auth failed:', await authResponse.text());
      throw new Error('Failed to authenticate with EzyParts');
    }

    const authData = await authResponse.json();
    const accessToken = authData.access_token;

    // Prepare order submission request
    const orderRequest: OrderSubmissionRequest = {
      inputMetaData: {
        checkCurrentPosition: order_data.forceOrder ? false : true
      },
      headers: {
        customerAccount: accountId,
        customerId: username,
        password: password,
        locationId: order_data.locationId || '',
        locationName: order_data.locationName || '',
        customerName: order_data.customerName || 'Workshop Customer',
        customerAddress: order_data.customerAddress || 'Workshop Address',
        customerSuburb: order_data.customerSuburb || '',
        purchaseOrderNumber: order_data.purchaseOrder || '',
        dateServed: new Date().toLocaleString('en-AU', {
          day: '2-digit',
          month: '2-digit', 
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        }).replace(/(\d{2})\/(\d{2})\/(\d{4}), (\d{2}):(\d{2}):(\d{2})/, '$1/$2/$3 $4:$5:$6'),
        deliveryType: order_data.deliveryType || '1',
        note: order_data.orderNotes || '',
        host: 'workshopbase.com',
        userAgent: 'Mozilla/5.0',
        ...(order_data.vehicleData && {
          encryptedVehicleId: order_data.vehicleData.encryptedVehicleId,
          rego: order_data.vehicleData.rego,
          make: order_data.vehicleData.make,
          model: order_data.vehicleData.model
        })
      },
      parts: order_data.parts || []
    };

    console.log('Submitting order to EzyParts:', JSON.stringify(orderRequest, null, 2));

    // Submit order to EzyParts
    const orderUrl = isProduction 
      ? 'https://api.ezyparts.burson.com.au/bapcorocc/v2/EzyParts/gms'
      : 'https://api.ezypartsqa.burson.com.au/bapcorocc/v2/EzyParts/gms';

    const orderResponse = await fetch(orderUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(orderRequest)
    });

    if (!orderResponse.ok) {
      const errorText = await orderResponse.text();
      console.error('Order submission failed:', errorText);
      throw new Error(`Order submission failed: ${orderResponse.status} ${orderText}`);
    }

    const orderResult: OrderSubmissionResponse = await orderResponse.json();
    
    console.log('Order submission response:', JSON.stringify(orderResult, null, 2));

    // Log the order submission
    await supabase.from('ezyparts_logs').insert({
      level: 'info',
      message: 'Order submitted successfully',
      data: {
        user_id,
        sales_order_number: orderResult.salesOrderNumber,
        success_items: orderResult.successOrderLines.length,
        failed_items: orderResult.failOrderLines.length
      }
    });

    return new Response(
      JSON.stringify({
        success: true,
        salesOrderNumber: orderResult.salesOrderNumber,
        successItems: orderResult.successOrderLines,
        failedItems: orderResult.failOrderLines,
        message: `Order ${orderResult.salesOrderNumber} submitted successfully`
      }),
      { status: 200, headers: corsHeaders }
    );

  } catch (error) {
    console.error('Error in ezyparts-order function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        success: false 
      }),
      { status: 500, headers: corsHeaders }
    );
  }
});
