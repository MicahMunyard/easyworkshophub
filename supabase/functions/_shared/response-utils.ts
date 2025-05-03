
/**
 * Shared utilities for edge function responses and error handling
 */

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

/**
 * Handles CORS preflight requests
 * @param req The incoming request
 * @returns A response if this is a preflight request, null otherwise
 */
export function handleCors(req: Request) {
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 204,
      headers: corsHeaders 
    });
  }
  return null;
}

/**
 * Creates a JSON response with the appropriate headers
 * @param data Any data to convert to JSON 
 * @param status HTTP status code (default: 200)
 * @returns Response object
 */
export function createJsonResponse(data: any, status = 200) {
  return new Response(
    JSON.stringify(data),
    { 
      status,
      headers: { 
        ...corsHeaders,
        'Content-Type': 'application/json'
      } 
    }
  );
}

/**
 * Generates a simple unique ID for error tracking
 * @returns A string ID
 */
export function generateErrorId(): string {
  return `err-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
}

/**
 * Creates an error response with consistent format
 * @param error The error that occurred
 * @param status HTTP status code (default: 500)
 * @returns Response object
 */
export function createErrorResponse(error: unknown, status = 500) {
  console.error("Error in edge function:", error);
  
  const errorMessage = error instanceof Error ? error.message : String(error);
  const isDev = Deno.env.get("ENVIRONMENT") === "development";
  
  return createJsonResponse({ 
    error: isDev ? errorMessage : "Internal server error",
    errorId: generateErrorId(),
    timestamp: new Date().toISOString()
  }, status);
}
