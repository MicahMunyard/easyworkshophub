
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { QuoteResponse } from '@/types/ezyparts';

interface EzyPartsContextType {
  currentQuote: QuoteResponse | null;
  setCurrentQuote: (quote: QuoteResponse | null) => void;
  credentials: {
    clientId: string;
    clientSecret: string;
    accountId: string;
    username: string;
    password: string;
  };
  client: null; // Simplified since we're using edge functions now
}

const EzyPartsContext = createContext<EzyPartsContextType | undefined>(undefined);

export const EzyPartsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentQuote, setCurrentQuote] = useState<QuoteResponse | null>(null);

  // These will be handled by Supabase secrets now
  const credentials = {
    clientId: '',
    clientSecret: '',
    accountId: '',
    username: '',
    password: ''
  };

  const value = {
    currentQuote,
    setCurrentQuote,
    credentials,
    client: null
  };

  return (
    <EzyPartsContext.Provider value={value}>
      {children}
    </EzyPartsContext.Provider>
  );
};

export const useEzyParts = () => {
  const context = useContext(EzyPartsContext);
  if (context === undefined) {
    throw new Error('useEzyParts must be used within an EzyPartsProvider');
  }
  return context;
};
