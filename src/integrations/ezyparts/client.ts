import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { 
  AuthResponse, 
  ProductInventoryRequest, 
  ProductInventoryResponse,
  OrderSubmissionRequest,
  OrderSubmissionResponse,
  QuoteResponse,
  VehicleSearchParams
} from '@/types/ezyparts';
import { getEzyPartsConfig } from './config';

/**
 * EzyParts API Client
 */
export class EzyPartsClient {
  private axiosInstance: AxiosInstance;
  private baseUrl: string;
  private authUrl: string;
  private token: string | null = null;
  private tokenExpiry: Date | null = null;
  
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

  constructor(
    isProduction: boolean = false,
    private clientId?: string,
    private clientSecret?: string
  ) {
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

  private async getAuthToken(): Promise<string> {
    // Check if we have a valid token
    if (this.token && this.tokenExpiry && new Date() < this.tokenExpiry) {
      return this.token;
    }
    
    if (!this.clientId || !this.clientSecret) {
      throw new Error('OAuth credentials not provided to EzyPartsClient');
    }
    
    try {
      // Create form data with exact parameters as in spec
      const params = new URLSearchParams();
      params.append('grant_type', 'client_credentials');
      params.append('client_id', this.clientId);
      params.append('client_secret', this.clientSecret);
      
      // Make the token request with form data as specified
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
      
      console.log('Successfully obtained new EzyParts OAuth token');
      return this.token;
    } catch (error) {
      console.error('Error obtaining EzyParts auth token:', error);
      throw new Error('Failed to authenticate with EzyParts API');
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
      // The correct endpoint according to PDF (page 17)
      const endpoint = '/inventory';
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
      // The correct endpoint according to PDF (page 20) is indeed the base URL
      const endpoint = '';
      const response = await this.makeAuthenticatedRequest<OrderSubmissionResponse>(endpoint, 'POST', request);
      console.log('Order submission response:', response);
      return response;
    } catch (error) {
      console.error('Failed to submit order:', error);
      throw new Error('Failed to submit order. Please try again.');
    }
  }

  /**
   * Parse the JSON payload from EzyParts webhook HTML page
   * For fat-client applications, this extracts the quote data from the HTML
   * 
   * @param htmlContent The HTML content from the EzyParts webhook page
   */
  public static parseQuotePayloadFromHtml(htmlContent: string): QuoteResponse | null {
    try {
      // Create a virtual DOM to properly parse the HTML
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlContent, 'text/html');
      
      // Find the hidden div with ID "quotePayload" as specified in the PDF
      const payloadDiv = doc.getElementById('quotePayload');
      
      if (!payloadDiv) {
        console.error('Could not find quotePayload div in HTML content');
        return null;
      }
      
      try {
        // Parse the JSON content from the div's text content
        const quoteResponse = JSON.parse(payloadDiv.textContent || '') as QuoteResponse;
        
        // Validate required fields according to documentation
        if (!this.validateQuoteResponse(quoteResponse)) {
          console.error('Parsed quote payload is missing required fields');
          return null;
        }
        
        return quoteResponse;
      } catch (parseError) {
        console.error('Failed to parse quote JSON:', parseError);
        return null;
      }
    } catch (error) {
      console.error('Error processing quote payload HTML:', error);
      return null;
    }
  }

  /**
   * Validate the quote response has all required fields as per documentation
   */
  private static validateQuoteResponse(quote: any): quote is QuoteResponse {
    return !!(
      quote &&
      quote.headers?.customerAccount &&
      quote.headers?.customerName &&
      quote.parts &&
      Array.isArray(quote.parts)
    );
  }

  /**
   * Generate URL for invoking EzyParts in a browser
   * This creates a form-based POST request as required by the documentation
   */
  public static generateEzyPartsUrl(params: VehicleSearchParams & {
    accountId: string;
    username: string;
    password: string;
    quoteUrl?: string;
    returnUrl?: string;
    isProduction?: boolean;
  }): string {
    const {
      accountId,
      username,
      password,
      vehicleId,
      regoNumber,
      state,
      make,
      model,
      year,
      seriesChassis,
      engine,
      isRegoSearch = false,
      quoteUrl = '',
      returnUrl = '',
      isProduction = false
    } = params;

    const env = isProduction ? EzyPartsClient.PRODUCTION : EzyPartsClient.STAGING;
    const baseUrl = `${env.WEB}/auth`;

    // Create a strictly formatted form HTML that matches documentation requirements
    const formHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>EzyParts Redirect</title>
        </head>
        <body>
          <form id="ezypartsForm" method="POST" action="${baseUrl}" style="display:none">
            <input type="hidden" name="accountId" value="${encodeURIComponent(accountId)}" />
            <input type="hidden" name="username" value="${encodeURIComponent(username)}" />
            <input type="hidden" name="password" value="${encodeURIComponent(password)}" />
            ${vehicleId ? `<input type="hidden" name="vehicleId" value="${encodeURIComponent(vehicleId.toString())}" />` : ''}
            ${regoNumber ? `<input type="hidden" name="regoNumber" value="${encodeURIComponent(regoNumber)}" />` : ''}
            ${state ? `<input type="hidden" name="state" value="${encodeURIComponent(state)}" />` : ''}
            ${make ? `<input type="hidden" name="make" value="${encodeURIComponent(make)}" />` : ''}
            ${model ? `<input type="hidden" name="model" value="${encodeURIComponent(model)}" />` : ''}
            ${year ? `<input type="hidden" name="year" value="${encodeURIComponent(year.toString())}" />` : ''}
            ${seriesChassis ? `<input type="hidden" name="seriesChassis" value="${encodeURIComponent(seriesChassis)}" />` : ''}
            ${engine ? `<input type="hidden" name="engine" value="${encodeURIComponent(engine)}" />` : ''}
            <input type="hidden" name="isRegoSearch" value="${isRegoSearch}" />
            <input type="hidden" name="quoteUrl" value="${encodeURIComponent(quoteUrl)}" />
            <input type="hidden" name="returnUrl" value="${encodeURIComponent(returnUrl)}" />
            <input type="hidden" name="userAgent" value="Mozilla/5.0" />
          </form>
          <script>
            window.onload = function() {
              document.getElementById('ezypartsForm').submit();
            }
          </script>
          <noscript>
            <p>Please enable JavaScript to continue to EzyParts.</p>
            <button type="submit" form="ezypartsForm">Continue to EzyParts</button>
          </noscript>
        </body>
      </html>
    `.trim();

    return formHtml;
  }
}
