
import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const FacebookWebhook: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    const handleWebhook = async () => {
      try {
        // Forward the request to the Supabase Edge Function
        const response = await supabase.functions.invoke('facebook-webhook', {
          method: 'GET',
          query: location.search,
        });

        // If it's a verification request, we need to return the challenge
        if (response.data && response.data.challenge) {
          document.body.innerHTML = response.data.challenge;
        }
      } catch (error) {
        console.error('Error handling webhook:', error);
      }
    };

    handleWebhook();
  }, [location]);

  // Return an empty div - the response will be handled directly
  return <div />;
};

export default FacebookWebhook;
