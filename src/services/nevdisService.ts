import { toast } from "@/components/ui/use-toast";
import { 
  AccessTokenResponse, 
  ExchangeTokenRequest, 
  VehicleReportRequest, 
  VehicleReportResponse,
  SystemStatusResponse
} from "@/types/nevdis";

// Base URLs - should be set via environment variables in a production app
const AUTH_BASE_URL = "https://api.dev.infoagent.com.au/auth/v1";
const NEVDIS_BASE_URL = "https://api.dev.infoagent.com.au/nevdis/v1";
const SYSTEM_BASE_URL = "https://api.dev.infoagent.com.au/system/v1";

// Authentication credentials - in production should be stored securely (e.g., through Supabase Secrets)
const CLIENT_ID = "9Q1scJ5wzCVClRvnLpDO";
const CLIENT_SECRET = "43cc2c01-ff9f-4b47-89ba-be0a94a1dc7b";

interface TokenCache {
  token: string;
  expiresAt: number;
}

class NevdisService {
  private tokenCache: TokenCache | null = null;
  
  /**
   * Get a valid JWT token, either from cache or by requesting a new one
   */
  private async getToken(): Promise<string> {
    const now = Date.now();
    
    // If we have a cached token that hasn't expired, use it
    if (this.tokenCache && this.tokenCache.expiresAt > now) {
      return this.tokenCache.token;
    }
    
    // Otherwise, request a new token
    try {
      const tokenRequest: ExchangeTokenRequest = {
        grant_type: "client_credentials",
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET
      };
      
      const response = await fetch(`${AUTH_BASE_URL}/token/oauth`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(tokenRequest)
      });
      
      if (!response.ok) {
        throw new Error(`Authentication error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json() as AccessTokenResponse;
      
      // Cache the token with its expiration time (adding a buffer to be safe)
      this.tokenCache = {
        token: data.access_token,
        expiresAt: now + (data.expires_in * 1000) - 60000 // Subtract 60 seconds as buffer
      };
      
      return data.access_token;
    } catch (error) {
      console.error("Failed to get auth token:", error);
      throw new Error("Authentication failed. Please try again later.");
    }
  }
  
  /**
   * Make an authenticated API call to the NEVDIS service
   */
  private async makeAuthenticatedRequest<T>(
    url: string,
    method: string = "GET",
    body?: any
  ): Promise<T> {
    try {
      const token = await this.getToken();
      
      const headers: HeadersInit = {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      };
      
      const requestOptions: RequestInit = {
        method,
        headers
      };
      
      if (body) {
        requestOptions.body = JSON.stringify(body);
      }
      
      const response = await fetch(url, requestOptions);
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }
      
      return await response.json() as T;
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }
  
  /**
   * Generate a vehicle report using NEVDIS
   */
  async generateVehicleReport(request: VehicleReportRequest): Promise<VehicleReportResponse> {
    try {
      return await this.makeAuthenticatedRequest<VehicleReportResponse>(
        `${NEVDIS_BASE_URL}/vehicle-report`,
        "POST",
        request
      );
    } catch (error) {
      toast({
        title: "Vehicle lookup failed",
        description: error instanceof Error ? error.message : "Failed to get vehicle information",
        variant: "destructive"
      });
      throw error;
    }
  }
  
  /**
   * Check the health/status of the NEVDIS services
   */
  async checkServiceStatus(): Promise<SystemStatusResponse> {
    return this.makeAuthenticatedRequest<SystemStatusResponse>(
      `${SYSTEM_BASE_URL}/services/status`
    );
  }
}

// Export a singleton instance for use throughout the application
export const nevdisService = new NevdisService();
