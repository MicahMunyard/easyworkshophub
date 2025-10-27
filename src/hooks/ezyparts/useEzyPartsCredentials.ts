import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface EzyPartsCredentials {
  id?: string;
  customer_account: string;
  customer_id: string;
  password: string;
  location_id?: string;
}

export const useEzyPartsCredentials = () => {
  const [credentials, setCredentials] = useState<EzyPartsCredentials | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchCredentials = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setCredentials(null);
        return;
      }

      const { data, error } = await supabase
        .from('user_ezyparts_credentials')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setCredentials(data || null);
    } catch (error) {
      console.error('Error fetching EzyParts credentials:', error);
      toast({
        title: "Error",
        description: "Failed to load EzyParts credentials",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const saveCredentials = async (creds: Omit<EzyPartsCredentials, 'id'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('user_ezyparts_credentials')
        .upsert({
          user_id: user.id,
          customer_account: creds.customer_account,
          customer_id: creds.customer_id,
          password: creds.password,
          location_id: creds.location_id || null
        })
        .select()
        .single();

      if (error) throw error;

      setCredentials(data);
      toast({
        title: "Success",
        description: "EzyParts credentials saved successfully"
      });

      return data;
    } catch (error) {
      console.error('Error saving EzyParts credentials:', error);
      toast({
        title: "Error",
        description: "Failed to save EzyParts credentials",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteCredentials = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('user_ezyparts_credentials')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      setCredentials(null);
      toast({
        title: "Success",
        description: "EzyParts credentials deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting EzyParts credentials:', error);
      toast({
        title: "Error",
        description: "Failed to delete EzyParts credentials",
        variant: "destructive"
      });
      throw error;
    }
  };

  const hasCredentials = useMemo(() => {
    return credentials !== null && 
           !!credentials.customer_account && 
           !!credentials.customer_id && 
           !!credentials.password;
  }, [credentials]);

  useEffect(() => {
    fetchCredentials();
  }, []);

  return {
    credentials,
    loading,
    saveCredentials,
    deleteCredentials,
    hasCredentials,
    refetch: fetchCredentials
  };
};
