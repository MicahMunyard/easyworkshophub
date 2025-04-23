
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { AccountingProvider, AccountingIntegration, SyncInvoiceResult } from '@/types/accounting';
import { Invoice } from '@/types/invoice';
import type { Database } from '@/integrations/supabase/types'; // import the type from generated types

export const useAccountingIntegrations = () => {
  const [integrations, setIntegrations] = useState<AccountingIntegration[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Use the correct Supabase generated type for accounting_integrations
  type DBIntegration = Database['public']['Tables']['accounting_integrations']['Row'];

  const fetchIntegrations = async () => {
    if (!user) {
      setIntegrations([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // Use the correct table import and casting
      const { data, error } = await supabase
        .from('accounting_integrations')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      setIntegrations(
        (data as DBIntegration[] | null)?.map((integration) => ({
          id: integration.id,
          userId: integration.user_id,
          provider: integration.provider as AccountingProvider,
          status: integration.status as 'active' | 'disconnected' | 'error',
          connectedAt: integration.connected_at,
          expiresAt: integration.expires_at || undefined,
          lastSyncAt: integration.last_sync_at || undefined,
          error: integration.last_error || undefined,
        })) || []
      );
    } catch (error) {
      console.error('Error fetching integrations:', error);
      toast({
        title: 'Error',
        description: 'Failed to load accounting integrations',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIntegrations();
  }, [user]);

  const connectXero = () => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to connect to Xero',
        variant: 'destructive'
      });
      return;
    }

    // Generate a URL to start the OAuth flow
    const clientId = '855D6BA1D7BD43DC879511D0040DB33D';
    const redirectUri = encodeURIComponent('https://app.workshopbase.com/integrations/xero/oauth');
    const scope = encodeURIComponent('accounting.transactions accounting.contacts');
    const state = encodeURIComponent(user.id);

    const authUrl = `https://login.xero.com/identity/connect/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&state=${state}`;

    // Open the Xero authorization window
    window.open(authUrl, '_blank', 'width=800,height=600');
  };

  const disconnectIntegration = async (provider: AccountingProvider) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('accounting_integrations')
        .update({ status: 'disconnected', updated_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .eq('provider', provider);

      if (error) {
        throw error;
      }

      toast({
        title: 'Success',
        description: `Disconnected from ${provider.toUpperCase()}`,
      });

      fetchIntegrations();
    } catch (error) {
      console.error(`Error disconnecting ${provider}:`, error);
      toast({
        title: 'Error',
        description: `Failed to disconnect from ${provider.toUpperCase()}`,
        variant: 'destructive'
      });
    }
  };

  const syncInvoice = async (invoice: Invoice, provider: AccountingProvider): Promise<SyncInvoiceResult> => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to sync invoices',
        variant: 'destructive'
      });
      return { success: false, error: 'Not authenticated' };
    }

    setIsSyncing(true);
    try {
      // Call edge function to sync the invoice
      const { data, error } = await supabase.functions.invoke('xero-integration/sync-invoice', {
        body: {
          invoice,
          provider
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.success && data.externalId) {
        // Update the invoice in our database with the external ID
        await supabase
          .from('user_invoices')
          .update({
            [`${provider}_invoice_id`]: data.externalId,
            updated_at: new Date().toISOString()
          })
          .eq('id', invoice.id);

        toast({
          title: 'Success',
          description: `Invoice ${invoice.invoiceNumber} synced to ${provider.toUpperCase()}`,
        });

        return { success: true, externalId: data.externalId };
      } else {
        throw new Error(data.error || 'Failed to sync invoice');
      }
    } catch (error: any) {
      console.error(`Error syncing invoice to ${provider}:`, error);
      toast({
        title: 'Sync Failed',
        description: error.message || `Failed to sync invoice to ${provider.toUpperCase()}`,
        variant: 'destructive'
      });
      return { success: false, error: error.message };
    } finally {
      setIsSyncing(false);
    }
  };

  const hasActiveIntegration = (provider: AccountingProvider) => {
    return integrations.some(i => i.provider === provider && i.status === 'active');
  };

  return {
    integrations,
    isLoading,
    isSyncing,
    connectXero,
    disconnectIntegration,
    syncInvoice,
    hasActiveIntegration,
    refreshIntegrations: fetchIntegrations
  };
};
