
import { useState, useEffect } from 'react';
import { useEzyParts } from '@/contexts/EzyPartsContext';
import type { QuoteResponse } from '@/types/ezyparts';

export const useEzyPartsDashboard = () => {
  const { currentQuote, setCurrentQuote } = useEzyParts();
  const [apiStatus, setApiStatus] = useState<'loading' | 'connected' | 'error'>('connected');

  // Since we're using edge functions, we'll assume configuration is handled by Supabase secrets
  const isConfigured = true;

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

  const clearQuote = () => {
    setCurrentQuote(null);
    localStorage.removeItem('ezyparts-current-quote');
  };

  const credentials = {
    clientId: '',
    clientSecret: '',
    accountId: '',
    username: '',
    password: ''
  };

  return {
    apiStatus,
    isConfigured,
    currentQuote,
    clearQuote,
    credentials
  };
};
