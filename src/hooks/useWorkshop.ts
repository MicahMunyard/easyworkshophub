import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Workshop {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  logo?: string;
}

export function useWorkshop() {
  const [workshop, setWorkshop] = useState<Workshop | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchWorkshop = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setLoading(false);
          return;
        }
        
        const { data, error: fetchError } = await supabase
          .from('profiles')
          .select('workshop_name, email_reply_to, phone_number, company_address, company_logo_url')
          .eq('user_id', user.id)
          .single();
        
        if (fetchError) throw fetchError;
        
        if (data) {
          setWorkshop({
            name: data.workshop_name || 'My Workshop',
            email: data.email_reply_to || '',
            phone: data.phone_number || '',
            address: data.company_address || '',
            logo: data.company_logo_url || '/lovable-uploads/toliccs-logo.png',
          });
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load workshop data'));
      } finally {
        setLoading(false);
      }
    };

    fetchWorkshop();

    // Subscribe to profile changes for real-time updates
    const channel = supabase
      .channel('profile-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
        },
        (payload) => {
          const newData = payload.new as any;
          setWorkshop({
            name: newData.workshop_name || 'My Workshop',
            email: newData.email_reply_to || '',
            phone: newData.phone_number || '',
            address: newData.company_address || '',
            logo: newData.company_logo_url || '/lovable-uploads/toliccs-logo.png',
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { workshop, loading, error };
}
