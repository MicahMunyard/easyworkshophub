import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { 
  AuthResponse, 
  ProductInventoryRequest, 
  ProductInventoryResponse,
  OrderSubmissionRequest,
  OrderSubmissionResponse,
  QuoteResponse
} from '@/types/ezyparts';
import { getEzyPartsConfig } from './config';
import { supabase } from '@/integrations/supabase/client';

/**
 * EzyParts API Client
 * 
 * Handles communication with the EzyParts API services according to the
 * EzyParts Integration with Workshop Management Systems Technical Specification v4.1
 */
export class EzyPartsClient {
  private axiosInstance: AxiosInstance;
  private baseUrl: string;
  private authUrl: string;
  private token: string | null = null;
  private tokenExpiry: Date | null = null;
  
  // Production or Staging environment URLs
  public static PRODUCTION = {
    BASE: 'https://api.ezyparts.burson.com.au/bapcorocc/v2/EzyParts/gms',
    AUTH: 'https://api.ezyparts.burson.com.au/authorizationserver/oauth/token',
    WEB: 'https://ezyparts.burson.com.au/burson'
  };
  
  public static STAGING = {
    BASE: 'https://api.ezypartsqa.burson.com.au/bapcorocc/v2/EzyParts/gms',
    AUTH: 'https://api.ezypartsqa.burson.com.au/authorizationserver/oauth/token',
    WEB: 'https://ezypartsqa.burson.com.au/burson'
  };

  /**
   * Initialize the EzyParts API Client
   * 
   * @param isProduction Whether to use production or staging environment
   */
  constructor(isProduction: boolean = false) {
    const env = isProduction ? EzyPartsClient.PRODUCTION : EzyPartsClient.STAGING;
    this.baseUrl = env.BASE;
    this.authUrl = env.AUTH;
    
    this.axiosInstance = axios.create({
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * Get the OAuth authentication token
   * Will fetch a new token if one doesn't exist or the current one is expired
   */
  private async getAuthToken(): Promise<string> {
    // Check if we have a valid token
    if (this.token && this.tokenExpiry && new Date() < this.tokenExpiry) {
      return this.token;
    }
    
    try {
      // Get OAuth credentials from Supabase
      const { data: clientId, error: clientIdError } = 
        await supabase.functions.invoke('get-secret', { body: { name: 'BURSONS_OAUTH_NAME' } });
      const { data: clientSecret, error: clientSecretError } = 
        await supabase.functions.invoke('get-secret', { body: { name: 'BURSONS_OAUTH_SECRET' } });

      if (clientIdError || clientSecretError || !clientId || !clientSecret) {
        throw new Error('Failed to retrieve Bursons OAuth credentials');
      }

      // Construct the form data for token request as specified in documentation
      const params = new URLSearchParams();
      params.append('grant_type', 'client_credentials'); // As specified in docs
      params.append('client_id', clientId);
      params.append('client_secret', clientSecret);
      
      // Make the token request
      const response = await axios.post<AuthResponse>(
        this.authUrl,
        params.toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );
      
      // Extract token and set expiry time (subtracting 60 seconds for safety)
      this.token = response.data.access_token;
      const expiresInMs = (response.data.expires_in - 60) * 1000;
      this.tokenExpiry = new Date(Date.now() + expiresInMs);
      
      console.log('Successfully obtained new Bursons OAuth token');
      return this.token;
    } catch (error) {
      console.error('Error obtaining Bursons auth token:', error);
      throw new Error('Failed to authenticate with Bursons API');
    }
  }

  /**
   * Make an authenticated API request to EzyParts
   */
  private async makeAuthenticatedRequest<T>(
    endpoint: string, 
    method: 'GET' | 'POST', 
    data?: any
  ): Promise<T> {
    try {
      // Get auth token
      const token = await this.getAuthToken();
      
      const config: AxiosRequestConfig = {
        method,
        url: `${this.baseUrl}${endpoint}`,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        data: method === 'POST' ? data : undefined
      };
      
      console.log('Making authenticated request:', {
        endpoint,
        method,
        baseUrl: this.baseUrl,
        hasData: !!data
      });
      
      const response = await this.axiosInstance.request<T>(config);
      return response.data;
    } catch (error: any) {
      console.error(`Error making ${method} request to ${endpoint}:`, error?.response?.data || error);
      throw error;
    }
  }

  /**
   * Check inventory for specific products at specified stores
   * 
   * @param request Product inventory request parameters
   */
  public async checkInventory(request: ProductInventoryRequest): Promise<ProductInventoryResponse> {
    try {
      console.log('Checking inventory with request:', request);
      const endpoint = '/v2/inventory';  // Updated endpoint as per documentation
      const response = await this.makeAuthenticatedRequest<ProductInventoryResponse>(endpoint, 'POST', request);
      console.log('Inventory check response:', response);
      return response;
    } catch (error) {
      console.error('Failed to check inventory:', error);
      throw new Error('Failed to check inventory. Please try again.');
    }
  }

  /**
   * Submit an order to EzyParts
   * 
   * @param request Order submission request parameters
   */
  public async submitOrder(request: OrderSubmissionRequest): Promise<OrderSubmissionResponse> {
    try {
      console.log('Submitting order with request:', request);
      const endpoint = '/v2/orders';  // Updated endpoint as per documentation
      const response = await this.makeAuthenticatedRequest<OrderSubmissionResponse>(endpoint, 'POST', request);
      console.log('Order submission response:', response);
      return response;
    } catch (error) {
      console.error('Failed to submit order:', error);
      throw new Error('Failed to submit order. Please try again.');
    }
  }

  /**
   * Generate URL for invoking EzyParts in a browser
   * 
   * @param accountId The EzyParts account number
   * @param username The EzyParts account username
   * @param password The EzyParts account password
   * @param vehicleId Optional: The EzyParts vehicle ID
   * @param quoteUrl URL for sending of JSON payload (if empty, payload will be in webhook HTML page)
   * @param returnUrl URL to return to after EzyParts session
   * @param isProduction Whether to use production or staging environment
   */
  public static generateEzyPartsUrl({
    accountId,
    username,
    password,
    vehicleId = '',
    regoNumber = '',
    state = '',
    make = '',
    model = '',
    year = '',
    seriesChassis = '',
    engine = '',
    isRegoSearch = false,
    quoteUrl = '',
    returnUrl = '',
    isProduction = false
  }: {
    accountId: string;
    username: string;
    password: string;
    vehicleId?: string | number;
    regoNumber?: string;
    state?: string;
    make?: string;
    model?: string;
    year?: string | number;
    seriesChassis?: string;
    engine?: string;
    isRegoSearch?: boolean;
    quoteUrl?: string;
    returnUrl?: string;
    isProduction?: boolean;
  }): string {
    const env = isProduction ? EzyPartsClient.PRODUCTION : EzyPartsClient.STAGING;
    const baseUrl = `${env.WEB}/auth`;
    
    // Create a form that will be submitted automatically via JavaScript
    return `
      <html>
        <body>
          <form id="ezypartsForm" method="POST" action="${baseUrl}">
            <input type="hidden" name="accountId" value="${accountId}" />
            <input type="hidden" name="username" value="${username}" />
            <input type="hidden" name="password" value="${password}" />
            ${vehicleId ? `<input type="hidden" name="vehicleId" value="${vehicleId}" />` : ''}
            ${regoNumber ? `<input type="hidden" name="regoNumber" value="${regoNumber}" />` : ''}
            ${state ? `<input type="hidden" name="state" value="${state}" />` : ''}
            ${make ? `<input type="hidden" name="make" value="${make}" />` : ''}
            ${model ? `<input type="hidden" name="model" value="${model}" />` : ''}
            ${year ? `<input type="hidden" name="year" value="${year}" />` : ''}
            ${seriesChassis ? `<input type="hidden" name="seriesChassis" value="${seriesChassis}" />` : ''}
            ${engine ? `<input type="hidden" name="engine" value="${engine}" />` : ''}
            <input type="hidden" name="isRegoSearch" value="${isRegoSearch}" />
            <input type="hidden" name="quoteUrl" value="${quoteUrl}" />
            <input type="hidden" name="returnUrl" value="${returnUrl}" />
            <input type="hidden" name="userAgent" value="Mozilla/5.0" />
          </form>
          <script>
            document.getElementById('ezypartsForm').submit();
          </script>
        </body>
      </html>
    `;
  }

  /**
   * Parse the JSON payload from EzyParts webhook HTML page
   * For fat-client applications, this extracts the quote data from the HTML
   * 
   * @param htmlContent The HTML content from the EzyParts webhook page
   */
  public static parseQuotePayloadFromHtml(htmlContent: string): QuoteResponse | null {
    try {
      // Find the hidden div with id "quotePayload"
      const match = htmlContent.match(/<div[^>]*id=["']quotePayload["'][^>]*>(.*?)<\/div>/s);
      if (!match || !match[1]) {
        return null;
      }
      
      // Parse the JSON content
      const jsonContent = match[1].trim();
      return JSON.parse(jsonContent) as QuoteResponse;
    } catch (error) {
      console.error('Error parsing quote payload from HTML:', error);
      return null;
    }
  }
}
