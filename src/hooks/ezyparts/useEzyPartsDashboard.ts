
import { useState, useEffect } from 'react';
import { useEzyParts } from '@/contexts/EzyPartsContext';
import type { QuoteResponse } from '@/types/ezyparts';

export const useEzyPartsDashboard = () => {
  const { credentials, client, currentQuote, setCurrentQuote } = useEzyParts();
  const [apiStatus, setApiStatus] = useState<'loading' | 'connected' | 'error'>('loading');

  // Check if configuration is set up
  const isConfigured = credentials.clientId && 
                      credentials.clientSecret && 
                      credentials.accountId && 
                      credentials.username && 
                      credentials.password;

  // Load stored quote
  useEffect(() => {
    if (!currentQuote) {
      const storedQuote = localStorage.getItem('ezyparts-current-quote');
      if (storedQuote) {
        try {
          setCurrentQuote(JSON.parse(storedQuote));
        } catch (error) {
          console.error('Error parsing stored quote:', error);
        }
      }
    }
  }, [currentQuote, setCurrentQuote]);

  // Check connection status
  useEffect(() => {
    let isMounted = true;

    const checkConnection = async () => {
      if (!client || !isConfigured) {
        if (isMounted) setApiStatus('error');
        return;
      }

      try {
        await client.checkInventory({
          customerAccount: credentials.accountId,
          customerId: credentials.username,
          password: credentials.password,
          stores: [{ code: '001' }],
          parts: [{ sku: 'TEST', qty: 1 }]
        });
        
        if (isMounted) setApiStatus('connected');
      } catch (error) {
        console.error('API connection test failed:', error);
        if (isMounted) setApiStatus('error');
      }
    };

    checkConnection();
    return () => { isMounted = false; };
  }, [client, credentials, isConfigured]);

  const clearQuote = () => {
    setCurrentQuote(null);
    localStorage.removeItem('ezyparts-current-quote');
  };

  return {
    apiStatus,
    isConfigured,
    currentQuote,
    clearQuote,
    credentials
  };
};
