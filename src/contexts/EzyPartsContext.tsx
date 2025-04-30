
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
  VehicleSearchParams,
  SavedQuote
} from '@/types/ezyparts';

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
  logAction: (action: string, data: any) => Promise<void>;
  connectionStatus: 'unchecked' | 'ok' | 'error';
  testEzyPartsConnection: () => Promise<boolean>;
  savedQuotes: SavedQuote[];
  getSavedQuotes: () => Promise<SavedQuote[]>;
  saveCurrentQuote: () => Promise<boolean>;
  clearSavedQuote: (timestamp: string) => Promise<void>;
}

const EzyPartsContext = createContext<EzyPartsContextType>({} as EzyPartsContextType);

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
  const [connectionStatus, setConnectionStatus] = useState<'unchecked' | 'ok' | 'error'>('unchecked');
  const [savedQuotes, setSavedQuotes] = useState<SavedQuote[]>([]);

  // Function to log important events to Supabase or local storage
  const logAction = async (action: string, data: any = {}) => {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      action,
      data: JSON.stringify(data),
      environment: isProduction ? 'production' : 'staging'
    };
    
    console.log(`[EzyParts ${action}]`, data);
    
    try {
      // Try to log to Supabase table
      const { data: userData } = await supabase.auth.getUser();
      
      // Use custom query to handle the fact that the table might be new
      const { error } = await supabase.from('ezyparts_action_logs')
        .insert({
          ...logEntry,
          user_id: userData.user?.id
        });
      
      if (error) {
        console.error('Error logging to Supabase:', error);
        
        // Fallback to localStorage if Supabase logging fails
        const logs = JSON.parse(localStorage.getItem('ezyparts_logs') || '[]');
        logs.push(logEntry);
        localStorage.setItem('ezyparts_logs', JSON.stringify(logs));
      }
    } catch (e) {
      console.error('Error during action logging:', e);
      
      // Fallback to localStorage
      try {
        const logs = JSON.parse(localStorage.getItem('ezyparts_logs') || '[]');
        logs.push(logEntry);
        localStorage.setItem('ezyparts_logs', JSON.stringify(logs));
      } catch (localError) {
        console.error('Failed to log to localStorage:', localError);
      }
    }
  };

  // Function to test EzyParts API connection
  const testEzyPartsConnection = async (): Promise<boolean> => {
    if (!client || !credentials.clientId || !credentials.clientSecret) {
      setConnectionStatus('error');
      return false;
    }
    
    setIsLoading(true);
    
    try {
      await logAction('test_connection_start', { 
        isProduction, 
        clientId: credentials.clientId ? 'provided' : 'missing',
        hasClient: !!client
      });
      
      // Try to authenticate and get a token
      await client.testConnection();
      
      setConnectionStatus('ok');
      await logAction('test_connection_success', { isProduction });
      setIsLoading(false);
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setLastError(error instanceof Error ? error : new Error('Connection test failed'));
      setConnectionStatus('error');
      
      await logAction('test_connection_failure', { 
        isProduction,
        error: errorMessage
      });
      
      setIsLoading(false);
      return false;
    }
  };

  // Function to get saved quotes from Supabase or localStorage
  const getSavedQuotes = async (): Promise<SavedQuote[]> => {
    try {
      await logAction('get_saved_quotes_start');
      
      // First try to get quotes from Supabase
      const { data: userData } = await supabase.auth.getUser();
      
      if (userData.user) {
        const { data, error } = await supabase
          .from('ezyparts_quotes')
          .select('*')
          .eq('user_id', userData.user.id)
          .order('created_at', { ascending: false });
          
        if (!error && data) {
          const quotes: SavedQuote[] = data.map(item => ({
            quote: item.quote_data as unknown as QuoteResponse, // Type assertion to help TypeScript
            timestamp: item.created_at,
            vehicle: {
              make: item.quote_data?.headers?.make || '',
              model: item.quote_data?.headers?.model || '',
              rego: item.quote_data?.headers?.rego
            }
          }));
          
          setSavedQuotes(quotes);
          await logAction('get_saved_quotes_success', { count: quotes.length });
          return quotes;
        } else {
          console.error('Error fetching quotes from Supabase:', error);
        }
      }
      
      // Fallback to localStorage if Supabase fails or user is not authenticated
      const localQuotes = localStorage.getItem('ezyparts_saved_quotes');
      if (localQuotes) {
        try {
          const parsedQuotes = JSON.parse(localQuotes) as SavedQuote[];
          setSavedQuotes(parsedQuotes);
          await logAction('get_saved_quotes_local', { count: parsedQuotes.length });
          return parsedQuotes;
        } catch (e) {
          console.error('Error parsing local quotes:', e);
        }
      }
      
      await logAction('get_saved_quotes_empty');
      return [];
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Unknown error';
      await logAction('get_saved_quotes_error', { error: errorMessage });
      console.error('Error getting saved quotes:', e);
      return [];
    }
  };

  // Function to save current quote
  const saveCurrentQuote = async (): Promise<boolean> => {
    if (!currentQuote) {
      toast({
        title: 'No Quote to Save',
        description: 'There is no current quote to save.',
        variant: 'destructive'
      });
      return false;
    }

    try {
      await logAction('save_quote_start', { 
        make: currentQuote.headers?.make, 
        model: currentQuote.headers?.model,
        parts: currentQuote.parts?.length || 0
      });
      
      const quoteToSave: SavedQuote = {
        quote: currentQuote,
        timestamp: new Date().toISOString(),
        vehicle: {
          make: currentQuote.headers?.make || '',
          model: currentQuote.headers?.model || '',
          rego: currentQuote.headers?.rego
        }
      };
      
      // First try to save to Supabase
      const { data: userData } = await supabase.auth.getUser();
      
      if (userData.user) {
        const { error } = await supabase
          .from('ezyparts_quotes')
          .insert({
            user_id: userData.user.id,
            quote_data: currentQuote as unknown as object // Type casting for Supabase JSON compatibility
          });
          
        if (!error) {
          // Refresh the quotes list
          await getSavedQuotes();
          
          toast({
            title: 'Quote Saved',
            description: `Quote for ${quoteToSave.vehicle.make} ${quoteToSave.vehicle.model} has been saved.`
          });
          
          await logAction('save_quote_success_db');
          return true;
        } else {
          console.error('Error saving quote to Supabase:', error);
        }
      }
      
      // Fallback to localStorage if Supabase fails or user is not authenticated
      const existingQuotes = JSON.parse(localStorage.getItem('ezyparts_saved_quotes') || '[]') as SavedQuote[];
      existingQuotes.unshift(quoteToSave);
      localStorage.setItem('ezyparts_saved_quotes', JSON.stringify(existingQuotes));
      
      // Update the state
      setSavedQuotes(existingQuotes);
      
      toast({
        title: 'Quote Saved Locally',
        description: `Quote for ${quoteToSave.vehicle.make} ${quoteToSave.vehicle.model} has been saved to your browser.`
      });
      
      await logAction('save_quote_success_local');
      return true;
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Unknown error';
      await logAction('save_quote_error', { error: errorMessage });
      
      toast({
        title: 'Error Saving Quote',
        description: 'There was a problem saving your quote. Please try again.',
        variant: 'destructive'
      });
      
      return false;
    }
  };

  // Function to clear saved quote
  const clearSavedQuote = async (timestamp: string): Promise<void> => {
    try {
      await logAction('clear_quote_start', { timestamp });
      
      // First try to delete from Supabase
      const { data: userData } = await supabase.auth.getUser();
      
      if (userData.user) {
        const quoteToDelete = savedQuotes.find(q => q.timestamp === timestamp);
        
        if (quoteToDelete) {
          const { error } = await supabase
            .from('ezyparts_quotes')
            .delete()
            .eq('created_at', timestamp)
            .eq('user_id', userData.user.id);
            
          if (!error) {
            // Update state
            setSavedQuotes(savedQuotes.filter(q => q.timestamp !== timestamp));
            
            toast({
              title: 'Quote Removed',
              description: `Quote has been removed from your saved quotes.`
            });
            
            await logAction('clear_quote_success_db', { timestamp });
            return;
          } else {
            console.error('Error deleting quote from Supabase:', error);
          }
        }
      }
      
      // Fallback to localStorage
      const existingQuotes = JSON.parse(localStorage.getItem('ezyparts_saved_quotes') || '[]') as SavedQuote[];
      const updatedQuotes = existingQuotes.filter(q => q.timestamp !== timestamp);
      localStorage.setItem('ezyparts_saved_quotes', JSON.stringify(updatedQuotes));
      
      // Update state
      setSavedQuotes(updatedQuotes);
      
      toast({
        title: 'Quote Removed',
        description: `Quote has been removed from your local storage.`
      });
      
      await logAction('clear_quote_success_local', { timestamp });
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Unknown error';
      await logAction('clear_quote_error', { error: errorMessage, timestamp });
      
      toast({
        title: 'Error Removing Quote',
        description: 'There was a problem removing the quote. Please try again.',
        variant: 'destructive'
      });
    }
  };

  useEffect(() => {
    const loadCredentials = async () => {
      try {
        await logAction('load_credentials_start', { isProduction });
        
        const { data: clientId, error: clientIdError } = 
          await supabase.functions.invoke('get-secret', { 
            body: { name: 'BURSONS_OAUTH_NAME' } 
          });
        
        const { data: clientSecret, error: clientSecretError } = 
          await supabase.functions.invoke('get-secret', { 
            body: { name: 'BURSONS_OAUTH_SECRET' } 
          });
        
        const { data: environment } = await supabase.functions.invoke('get-secret', { 
          body: { name: 'EZYPARTS_ENVIRONMENT' } 
        });

        if (clientIdError || clientSecretError) {
          await logAction('load_credentials_error', {
            clientIdError: clientIdError?.message,
            clientSecretError: clientSecretError?.message
          });
          
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
          
          await logAction('load_credentials_success', { 
            clientId: 'received',
            clientSecret: 'received' 
          });
          
          console.log('EzyParts credentials set successfully');
        } else {
          await logAction('load_credentials_incomplete', {
            hasClientId: !!clientId,
            hasClientSecret: !!clientSecret
          });
          
          console.error('Missing EzyParts OAuth credentials');
          toast({
            title: "EzyParts Setup Required",
            description: "Please configure your BURSONS_OAUTH_NAME and BURSONS_OAUTH_SECRET in Supabase secrets.",
            variant: "destructive"
          });
        }

        if (environment) {
          const newIsProduction = environment === 'production';
          setIsProduction(newIsProduction);
          await logAction('environment_set', { environment, isProduction: newIsProduction });
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        await logAction('load_credentials_exception', { error: errorMessage });
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

  React.useEffect(() => {
    if (credentials.clientId && credentials.clientSecret) {
      try {
        const newClient = new EzyPartsClient(
          isProduction,
          credentials.clientId,
          credentials.clientSecret
        );
        setClient(newClient);
        setLastError(null);
        logAction('client_initialized', { isProduction });
        
        // Test the connection with the new client
        setTimeout(() => {
          testEzyPartsConnection()
            .then(success => {
              if (success) {
                logAction('auto_connection_test_success', { isProduction });
              } else {
                logAction('auto_connection_test_failure', { isProduction });
              }
            })
            .catch(e => {
              logAction('auto_connection_test_error', { 
                error: e instanceof Error ? e.message : 'Unknown error' 
              });
            });
        }, 500);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logAction('client_initialization_error', { error: errorMessage });
        console.error('Error initializing EzyParts client:', error);
        setLastError(error instanceof Error ? error : new Error('Unknown error initializing EzyParts client'));
        setClient(null);
      }
    } else {
      setClient(null);
    }
  }, [credentials.clientId, credentials.clientSecret, isProduction]);

  const generateEzyPartsUrl = useCallback((params: VehicleSearchParams & { 
    quoteUrl?: string;
    returnUrl?: string;
  }) => {
    const baseUrl = isProduction ? 
      'https://ezyparts.burson.com.au/burson/auth' : 
      'https://ezypartsqa.burson.com.au/burson/auth';
      
    logAction('generate_url', { 
      params: { ...params, password: '***' },
      baseUrl
    });
    
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
  }, [credentials, isProduction, logAction]);

  const handleQuotePayload = useCallback((htmlContent: string): QuoteResponse | null => {
    try {
      logAction('parse_quote_payload_start', { contentLength: htmlContent.length });
      
      const result = EzyPartsClient.parseQuotePayloadFromHtml(htmlContent);
      
      if (result) {
        logAction('parse_quote_payload_success', { 
          hasVehicleInfo: !!result.headers?.make,
          partsCount: result.parts?.length || 0
        });
        
        // Save to localStorage for persistence
        if (result) {
          setCurrentQuote(result);
          localStorage.setItem('ezyparts-current-quote', JSON.stringify(result));
        }
      } else {
        logAction('parse_quote_payload_failure', { 
          contentPreview: htmlContent.substring(0, 200) + '...'
        });
      }
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logAction('parse_quote_payload_error', { error: errorMessage });
      return null;
    }
  }, [logAction]);

  const checkInventory = useCallback(async (
    request: Omit<ProductInventoryRequest, 'customerAccount' | 'customerId' | 'password'>
  ): Promise<ProductInventoryResponse> => {
    if (!client) {
      const error = new Error('EzyParts client not initialized');
      logAction('inventory_check_error', { 
        error: error.message,
        reason: 'client_not_initialized' 
      });
      throw error;
    }

    setIsLoading(true);
    setLastError(null);

    try {
      logAction('inventory_check_start', { 
        storeCount: request.stores.length,
        itemCount: request.parts.length
      });
      
      const fullRequest: ProductInventoryRequest = {
        customerAccount: credentials.accountId,
        customerId: credentials.username,
        password: credentials.password,
        ...request
      };

      const response = await client.checkInventory(fullRequest);
      
      logAction('inventory_check_success', { 
        responseItems: response.inventory.length
      });
      
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logAction('inventory_check_failure', { error: errorMessage });
      console.error('Error checking inventory:', error);
      setLastError(error instanceof Error ? error : new Error('Unknown error checking inventory'));
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [client, credentials, logAction]);

  const submitOrder = useCallback(async (
    request: Omit<OrderSubmissionRequest, 'headers.customerAccount' | 'headers.customerId' | 'headers.password'>
  ): Promise<OrderSubmissionResponse> => {
    if (!client) {
      const error = new Error('EzyParts client not initialized');
      logAction('order_submission_error', { 
        error: error.message,
        reason: 'client_not_initialized' 
      });
      throw error;
    }

    setIsLoading(true);
    setLastError(null);

    try {
      logAction('order_submission_start', { 
        itemCount: request.parts.length,
        forceOrder: request.inputMetaData.checkCurrentPosition
      });
      
      const fullRequest = JSON.parse(JSON.stringify(request)) as OrderSubmissionRequest;
      
      fullRequest.headers.customerAccount = credentials.accountId;
      fullRequest.headers.customerId = credentials.username;
      fullRequest.headers.password = credentials.password;

      const response = await client.submitOrder(fullRequest);
      
      logAction('order_submission_success', { 
        orderNumber: response.salesOrderNumber,
        successItems: response.successOrderLines.length,
        failedItems: response.failOrderLines.length
      });
      
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logAction('order_submission_failure', { error: errorMessage });
      console.error('Error submitting order:', error);
      setLastError(error instanceof Error ? error : new Error('Unknown error submitting order'));
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [client, credentials, logAction]);

  // Load stored quote on initial render
  useEffect(() => {
    const storedQuote = localStorage.getItem('ezyparts-current-quote');
    if (storedQuote && !currentQuote) {
      try {
        const parsedQuote = JSON.parse(storedQuote);
        setCurrentQuote(parsedQuote);
        logAction('load_stored_quote', { 
          hasVehicleInfo: !!parsedQuote.headers?.make,
          partsCount: parsedQuote.parts?.length || 0
        });
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'Unknown error';
        logAction('load_stored_quote_error', { error: errorMessage });
        console.error('Error parsing stored quote:', e);
      }
    }
    
    // Load saved quotes
    getSavedQuotes()
      .catch(e => console.error('Error loading saved quotes on init:', e));
  }, []);

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
    isLoading,
    logAction,
    connectionStatus,
    testEzyPartsConnection,
    savedQuotes,
    getSavedQuotes,
    saveCurrentQuote,
    clearSavedQuote
  };

  return (
    <EzyPartsContext.Provider value={value}>
      {children}
    </EzyPartsContext.Provider>
  );
};

export const useEzyParts = (): EzyPartsContextType => {
  const context = useContext(EzyPartsContext);
  
  if (!context) {
    throw new Error('useEzyParts must be used within an EzyPartsProvider');
  }
  
  return context;
};
