
/**
 * Standard CORS headers for Supabase Edge Functions
 */
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

/**
 * Helper to create CORS response headers with content-type
 */
export function createResponseHeaders(contentType = 'application/json') {
  return {
    ...corsHeaders,
    'Content-Type': contentType
  };
}
