
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OrderSubmissionData {
  parts: Array<{
    qty: number;
    sku: string;
    nettPriceEach: number;
    retailPriceEa?: number;
  }>;
  customerName?: string;
  customerAddress?: string;
  customerSuburb?: string;
  purchaseOrder?: string;
  orderNotes?: string;
  deliveryType?: '1' | '2';
  forceOrder?: boolean;
  locationId?: string;
  locationName?: string;
  vehicleData?: {
    encryptedVehicleId?: number;
    rego?: string;
    make?: string;
    model?: string;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== EzyParts Order Submission Function Called ===');
    
    const { user_id, order_data } = await req.json() as {
      user_id: string;
      order_data: OrderSubmissionData;
    };

    console.log('Processing order for user:', user_id);
    console.log('Order data:', JSON.stringify(order_data, null, 2));

    // Get EzyParts configuration from secrets with validation
    const environment = Deno.env.get('EZYPARTS_ENVIRONMENT') || 'staging';
    const clientId = Deno.env.get('BURSONS_OAUTH_NAME');
    const clientSecret = Deno.env.get('BURSONS_OAUTH_SECRET');

    console.log('Environment variables check:');
    console.log('- EZYPARTS_ENVIRONMENT:', environment);
    console.log('- BURSONS_OAUTH_NAME exists:', !!clientId);
    console.log('- BURSONS_OAUTH_SECRET exists:', !!clientSecret);

    if (!clientId || !clientSecret) {
      throw new Error('EzyParts OAuth credentials not configured');
    }

    // Determine API endpoints based on environment
    const endpoints = environment === 'production' ? {
      auth: 'https://api.ezyparts.burson.com.au/authorizationserver/oauth/token',
      api: 'https://api.ezyparts.burson.com.au/bapcorocc/v2/EzyParts/gms'
    } : {
      auth: 'https://api.ezypartsqa.burson.com.au/authorizationserver/oauth/token',
      api: 'https://api.ezypartsqa.burson.com.au/bapcorocc/v2/EzyParts/gms'
    };

    console.log('Using environment:', environment);
    console.log('Auth endpoint:', endpoints.auth);
    console.log('API endpoint:', endpoints.api);

    // Validate required fields
    if (!order_data.parts || !Array.isArray(order_data.parts) || order_data.parts.length === 0) {
      throw new Error('Order must contain at least one part');
    }

    // Validate each part has required fields
    for (const part of order_data.parts) {
      if (!part.sku || !part.qty || part.nettPriceEach === undefined) {
        throw new Error('Each part must have sku, qty, and nettPriceEach');
      }
    }

    console.log('Input validation passed for', order_data.parts.length, 'parts');

    // Step 1: Get OAuth token
    console.log('Requesting OAuth token...');
    const tokenParams = new URLSearchParams();
    tokenParams.append('grant_type', 'client_credentials');
    tokenParams.append('client_id', clientId);
    tokenParams.append('client_secret', clientSecret);

    const tokenResponse = await fetch(endpoints.auth, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: tokenParams.toString()
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Token request failed:', errorText);
      console.error('Token response status:', tokenResponse.status);
      console.error('Token response headers:', Object.fromEntries(tokenResponse.headers.entries()));
      throw new Error(`Failed to get OAuth token: ${tokenResponse.status} ${tokenResponse.statusText} - ${errorText}`);
    }

    const tokenData = await tokenResponse.json();
    console.log('OAuth token obtained successfully');

    // Step 2: Prepare order submission request according to EzyParts API spec
    const currentDate = new Date();
    
    // Format date as dd/mm/yyyy hh:mm:ss (24-hour format) as per EzyParts spec
    const day = String(currentDate.getDate()).padStart(2, '0');
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const year = currentDate.getFullYear();
    const hours = String(currentDate.getHours()).padStart(2, '0');
    const minutes = String(currentDate.getMinutes()).padStart(2, '0');
    const seconds = String(currentDate.getSeconds()).padStart(2, '0');
    const dateServed = `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;

    console.log('Date served formatted as:', dateServed);

    // Build the order request payload exactly as specified in the documentation
    const orderRequest = {
      inputMetaData: {
        checkCurrentPosition: !order_data.forceOrder // Force order indicator (inverted)
      },
      headers: {
        customerAccount: "400022", // Default account from staging
        customerId: "400022_workshopbase", // Default customer ID
        password: "Burson2023", // Default password for staging
        locationId: order_data.locationId || "",
        locationName: order_data.locationName || "",
        customerName: order_data.customerName || "WorkshopBase Customer",
        customerAddress: order_data.customerAddress || "",
        customerSuburb: order_data.customerSuburb || "",
        purchaseOrderNumber: order_data.purchaseOrder || "",
        dateServed: dateServed,
        repId: "",
        encryptedVehicleId: order_data.vehicleData?.encryptedVehicleId || null,
        rego: order_data.vehicleData?.rego || "",
        make: order_data.vehicleData?.make || "",
        model: order_data.vehicleData?.model || "",
        deliveryType: order_data.deliveryType || "1",
        note: order_data.orderNotes || "",
        host: "workshopbase.com",
        userAgent: "Mozilla/5.0",
        salesOrderSalesAuditList: []
      },
      parts: order_data.parts.map(part => ({
        qty: part.qty,
        sku: part.sku,
        nettPriceEach: part.nettPriceEach,
        retailPriceEa: part.retailPriceEa || part.nettPriceEach * 1.2 // Default 20% markup if not provided
      }))
    };

    console.log('Submitting order to EzyParts:', JSON.stringify(orderRequest, null, 2));

    // Step 3: Submit order to EzyParts using correct /gms endpoint
    const orderResponse = await fetch(endpoints.api, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(orderRequest)
    });

    const responseText = await orderResponse.text();
    console.log('Raw API response:', responseText);
    console.log('Response status:', orderResponse.status);
    console.log('Response headers:', Object.fromEntries(orderResponse.headers.entries()));

    if (!orderResponse.ok) {
      console.error('Order submission failed:', responseText);
      
      // Try to parse error response for better error handling
      let errorDetails = responseText;
      try {
        const errorJson = JSON.parse(responseText);
        if (errorJson.errors && Array.isArray(errorJson.errors)) {
          errorDetails = errorJson.errors.map(e => e.message).join(', ');
        }
      } catch (parseError) {
        console.log('Could not parse error response as JSON, using raw text');
      }
      
      throw new Error(`Order submission failed: ${orderResponse.status} ${orderResponse.statusText} - ${errorDetails}`);
    }

    let orderResult;
    try {
      orderResult = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse response JSON:', parseError);
      throw new Error(`Invalid JSON response from EzyParts API: ${responseText}`);
    }

    console.log('Order submission response:', JSON.stringify(orderResult, null, 2));

    // Process the response according to EzyParts API specification
    const response = {
      success: true,
      salesOrderNumber: orderResult.salesOrderNumber,
      successItems: orderResult.successOrderLines || [],
      failedItems: orderResult.failOrderLines || [],
      headers: orderResult.headers,
      message: orderResult.failOrderLines && orderResult.failOrderLines.length > 0 
        ? `Order submitted with ${orderResult.failOrderLines.length} discrepancies`
        : 'Order submitted successfully'
    };

    console.log('Processed response:', JSON.stringify(response, null, 2));

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error) {
    console.error('Error in EzyParts order submission:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      message: 'Failed to submit order to EzyParts'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});
