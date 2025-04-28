import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { EzyPartsClient } from '@/integrations/ezyparts/client';
import { useToast } from '@/hooks/use-toast';
import type { 
  ProductInventoryRequest, 
  ProductInventoryResponse,
  OrderSubmissionRequest,
  OrderSubmissionResponse,
  QuoteResponse,
  VehicleSearchParams
} from '@/types/ezyparts';

// Define context type
interface EzyPartsContextType {
  isProduction: boolean;
  setIsProduction: (value: boolean) => void;
  credentials: {
    clientId: string;
    clientSecret: string;
    accountId: string;
    username: string;
    password: string;
  };
  setCredentials: (credentials: {
    clientId: string;
    clientSecret: string;
    accountId: string;
    username: string;
    password: string;
  }) => void;
  client: EzyPartsClient | null;
  currentQuote: QuoteResponse | null;
  setCurrentQuote: (quote: QuoteResponse | null) => void;
  generateEzyPartsUrl: (params: VehicleSearchParams & { 
    quoteUrl?: string;
    returnUrl?: string;
  }) => string;
  handleQuotePayload: (htmlContent: string) => QuoteResponse | null;
  checkInventory: (request: Omit<ProductInventoryRequest, 'customerAccount' | 'customerId' | 'password'>) => Promise<ProductInventoryResponse>;
  submitOrder: (request: Omit<OrderSubmissionRequest, 'headers.customerAccount' | 'headers.customerId' | 'headers.password'>) => Promise<OrderSubmissionResponse>;
  lastError: Error | null;
  isLoading: boolean;
}

// Create context with default values
const EzyPartsContext = createContext<EzyPartsContextType>({} as EzyPartsContextType);

// Context provider component
export const EzyPartsProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const { toast } = useToast();
  const [isProduction, setIsProduction] = useState<boolean>(false);
  const [credentials, setCredentials] = useState<{
    clientId: string;
    clientSecret: string;
    accountId: string;
    username: string;
    password: string;
  }>({
    clientId: '',
    clientSecret: '',
    accountId: '',
    username: '',
    password: ''
  });
  const [client, setClient] = useState<EzyPartsClient | null>(null);
  const [currentQuote, setCurrentQuote] = useState<QuoteResponse | null>(null);
  const [lastError, setLastError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Load credentials from Supabase secrets on mount
  useEffect(() => {
    const loadCredentials = async () => {
      try {
        // Get OAuth credentials with consistent naming
        const { data: clientId, error: clientIdError } = 
          await supabase.functions.invoke('get-secret', { 
            body: { name: 'BURSONS_OAUTH_NAME' } 
          });
        
        const { data: clientSecret, error: clientSecretError } = 
          await supabase.functions.invoke('get-secret', { 
            body: { name: 'BURSONS_OAUTH_SECRET' } 
          });
        
        // Get the environment setting
        const { data: environment } = await supabase.functions.invoke('get-secret', { 
          body: { name: 'EZYPARTS_ENVIRONMENT' } 
        });

        console.log('Loaded EzyParts credentials:', { 
          clientId: clientId ? 'set' : 'not set', 
          clientSecret: clientSecret ? 'set' : 'not set', 
          environment 
        });

        if (clientIdError || clientSecretError) {
          console.error('Errors retrieving credentials:', {
            clientIdError,
            clientSecretError
          });
        }

        if (clientId && clientSecret) {
          setCredentials({
            accountId: clientId,
            username: clientId,
            password: clientSecret,
            clientId: clientId,
            clientSecret: clientSecret
          });
          
          console.log('EzyParts credentials set successfully');
        } else {
          console.error('Missing EzyParts OAuth credentials:', {
            clientId: clientId ? 'set' : 'not set',
            clientSecret: clientSecret ? 'set' : 'not set'
          });
          
          toast({
            title: "EzyParts Setup Required",
            description: "Please configure your BURSONS_OAUTH_NAME and BURSONS_OAUTH_SECRET in Supabase secrets.",
            variant: "destructive"
          });
        }

        if (environment) {
          setIsProduction(environment === 'production');
        }
      } catch (error) {
        console.error('Error loading EzyParts credentials:', error);
        toast({
          title: "Error Loading Credentials",
          description: "Failed to load EzyParts credentials. Please check your configuration.",
          variant: "destructive"
        });
      }
    };

    loadCredentials();
  }, [toast]);

  // Initialize client when credentials change
  React.useEffect(() => {
    if (credentials.clientId && credentials.clientSecret) {
      try {
        // Only pass isProduction
        const newClient = new EzyPartsClient(isProduction);
        setClient(newClient);
        setLastError(null);
      } catch (error) {
        console.error('Error initializing EzyParts client:', error);
        setLastError(error instanceof Error ? error : new Error('Unknown error initializing EzyParts client'));
        setClient(null);
      }
    } else {
      setClient(null);
    }
  }, [credentials.clientId, credentials.clientSecret, isProduction]);

  // Generate URL for invoking EzyParts
  const generateEzyPartsUrl = useCallback((params: VehicleSearchParams & { 
    quoteUrl?: string;
    returnUrl?: string;
  }) => {
    const baseUrl = isProduction ? 
      'https://ezyparts.burson.com.au/burson/auth' : 
      'https://ezypartsqa.burson.com.au/burson/auth';
      
    return baseUrl + '?' + new URLSearchParams({
      accountId: credentials.accountId,
      username: credentials.username,
      password: credentials.password,
      ...(params.regoNumber && { regoNumber: params.regoNumber }),
      ...(params.state && { state: params.state }),
      ...(params.isRegoSearch !== undefined && { isRegoSearch: params.isRegoSearch.toString() }),
      ...(params.make && { make: params.make }),
      ...(params.model && { model: params.model }),
      ...(params.year && { year: params.year.toString() }),
      ...(params.vehicleId && { vehicleId: params.vehicleId.toString() }),
      ...(params.seriesChassis && { seriesChassis: params.seriesChassis }),
      ...(params.engine && { engine: params.engine }),
      ...(params.quoteUrl && { quoteUrl: params.quoteUrl }),
      ...(params.returnUrl && { returnUrl: params.returnUrl }),
      userAgent: 'Mozilla/5.0'
    }).toString();
  }, [credentials, isProduction]);

  // Handle quote payload from HTML
  const handleQuotePayload = useCallback((htmlContent: string): QuoteResponse | null => {
    return EzyPartsClient.parseQuotePayloadFromHtml(htmlContent);
  }, []);

  // Check inventory
  const checkInventory = useCallback(async (
    request: Omit<ProductInventoryRequest, 'customerAccount' | 'customerId' | 'password'>
  ): Promise<ProductInventoryResponse> => {
    if (!client) {
      throw new Error('EzyParts client not initialized');
    }

    setIsLoading(true);
    setLastError(null);

    try {
      const fullRequest: ProductInventoryRequest = {
        customerAccount: credentials.accountId,
        customerId: credentials.username,
        password: credentials.password,
        ...request
      };

      const response = await client.checkInventory(fullRequest);
      return response;
    } catch (error) {
      console.error('Error checking inventory:', error);
      setLastError(error instanceof Error ? error : new Error('Unknown error checking inventory'));
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [client, credentials]);

  // Submit order
  const submitOrder = useCallback(async (
    request: Omit<OrderSubmissionRequest, 'headers.customerAccount' | 'headers.customerId' | 'headers.password'>
  ): Promise<OrderSubmissionResponse> => {
    if (!client) {
      throw new Error('EzyParts client not initialized');
    }

    setIsLoading(true);
    setLastError(null);

    try {
      // Deep copy to avoid mutating the original
      const fullRequest = JSON.parse(JSON.stringify(request)) as OrderSubmissionRequest;
      
      // Set the credentials
      fullRequest.headers.customerAccount = credentials.accountId;
      fullRequest.headers.customerId = credentials.username;
      fullRequest.headers.password = credentials.password;

      const response = await client.submitOrder(fullRequest);
      return response;
    } catch (error) {
      console.error('Error submitting order:', error);
      setLastError(error instanceof Error ? error : new Error('Unknown error submitting order'));
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [client, credentials]);

  // Context value
  const value: EzyPartsContextType = {
    isProduction,
    setIsProduction,
    credentials,
    setCredentials,
    client,
    currentQuote,
    setCurrentQuote,
    generateEzyPartsUrl,
    handleQuotePayload,
    checkInventory,
    submitOrder,
    lastError,
    isLoading
  };

  return (
    <EzyPartsContext.Provider value={value}>
      {children}
    </EzyPartsContext.Provider>
  );
};

// Custom hook to use the EzyParts context
export const useEzyParts = (): EzyPartsContextType => {
  const context = useContext(EzyPartsContext);
  
  if (!context) {
    throw new Error('useEzyParts must be used within an EzyPartsProvider');
  }
  
  return context;
};
