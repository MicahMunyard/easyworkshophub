
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { EzyPartsClient } from '@/integrations/ezyparts/client';
import { supabase } from '@/integrations/supabase/client';
import type { 
  ProductInventoryRequest, 
  OrderSubmissionRequest 
} from '@/types/ezyparts';

export const useEzyPartsApi = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const initializeClient = useCallback(async () => {
    try {
      const { data: { clientId }, error: clientIdError } = 
        await supabase.functions.invoke('get-secret', { body: { name: 'EZYPARTS_CLIENT_ID' } });
      const { data: { clientSecret }, error: clientSecretError } = 
        await supabase.functions.invoke('get-secret', { body: { name: 'EZYPARTS_CLIENT_SECRET' } });

      if (clientIdError || clientSecretError) {
        throw new Error('Failed to retrieve EzyParts credentials');
      }

      return new EzyPartsClient(clientId, clientSecret, process.env.NODE_ENV === 'production');
    } catch (error) {
      console.error('Error initializing EzyParts client:', error);
      throw error;
    }
  }, []);

  const checkInventory = useCallback(async (request: ProductInventoryRequest) => {
    setIsLoading(true);
    try {
      const client = await initializeClient();
      const response = await client.checkInventory(request);
      return response;
    } catch (error) {
      toast({
        title: 'Error checking inventory',
        description: 'Failed to check EzyParts inventory. Please try again.',
        variant: 'destructive'
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [toast, initializeClient]);

  const submitOrder = useCallback(async (request: OrderSubmissionRequest) => {
    setIsLoading(true);
    try {
      const client = await initializeClient();
      const response = await client.submitOrder(request);
      return response;
    } catch (error) {
      toast({
        title: 'Error submitting order',
        description: 'Failed to submit order to EzyParts. Please try again.',
        variant: 'destructive'
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [toast, initializeClient]);

  return {
    isLoading,
    checkInventory,
    submitOrder
  };
};
