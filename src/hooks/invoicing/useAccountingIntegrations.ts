import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { AccountingIntegration, AccountingProvider, SyncInvoiceResult } from "@/types/accounting";
import { Invoice } from "@/types/invoice";

export const useAccountingIntegrations = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [integrations, setIntegrations] = useState<AccountingIntegration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    if (user) {
      fetchIntegrations();
    } else {
      setIntegrations([]);
      setIsLoading(false);
    }
  }, [user]);

  const fetchIntegrations = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("accounting_integrations")
        .select("*")
        .eq("user_id", user.id);

      if (error) throw error;

      if (data && Array.isArray(data)) {
        const formattedIntegrations: AccountingIntegration[] = data.map(item => ({
          id: item.id,
          userId: item.user_id,
          provider: item.provider as AccountingProvider,
          status: item.status as "active" | "disconnected" | "error",
          connectedAt: item.connected_at,
          expiresAt: item.expires_at,
          lastSyncAt: item.last_sync_at,
          error: item.last_error,
          accessToken: item.access_token,
          refreshToken: item.refresh_token,
          tenantId: item.tenant_id
        }));
        setIntegrations(formattedIntegrations);
      }
    } catch (error) {
      console.error("Error fetching integrations:", error);
      toast({
        title: "Error",
        description: "Failed to load accounting integrations",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const connectXero = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("xero-integration/get-auth-url");

      if (error) throw error;
      if (data?.authUrl) {
        window.location.href = data.authUrl;
      }
    } catch (error) {
      console.error("Error connecting to Xero:", error);
      toast({
        title: "Connection Failed",
        description: "Could not initiate Xero connection",
        variant: "destructive",
      });
    }
  };

  const connectMyob = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("myob-integration/get-auth-url");

      if (error) throw error;
      if (data?.authUrl) {
        window.location.href = data.authUrl;
      }
    } catch (error) {
      console.error("Error connecting to MYOB:", error);
      toast({
        title: "Connection Failed",
        description: "Could not initiate MYOB connection",
        variant: "destructive",
      });
    }
  };

  const disconnectIntegration = async (provider: AccountingProvider) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from("accounting_integrations")
        .update({ status: "disconnected" })
        .eq("user_id", user.id)
        .eq("provider", provider);

      if (error) throw error;

      setIntegrations(prev =>
        prev.map(integration =>
          integration.provider === provider
            ? { ...integration, status: "disconnected" }
            : integration
        )
      );

      toast({
        title: "Disconnected",
        description: `Successfully disconnected from ${provider === 'xero' ? 'Xero' : 'MYOB'}`,
      });

      return true;
    } catch (error) {
      console.error(`Error disconnecting from ${provider}:`, error);
      toast({
        title: "Disconnection Failed",
        description: `Could not disconnect from ${provider === 'xero' ? 'Xero' : 'MYOB'}`,
        variant: "destructive",
      });
      return false;
    }
  };

  const syncInvoice = async (
    invoice: Invoice,
    provider: AccountingProvider
  ): Promise<SyncInvoiceResult> => {
    if (!user || !hasActiveIntegration(provider)) {
      return { success: false, error: `No active ${provider} integration` };
    }

    setIsSyncing(true);
    try {
      // Call the provider-specific edge function
      const { data, error } = await supabase.functions.invoke(
        `${provider}-integration/sync-invoice`,
        {
          body: { invoice, provider }
        }
      );

      if (error || !data?.success) {
        throw new Error(error?.message || data?.error || `Failed to sync invoice to ${provider}`);
      }

      // Update the invoice in the database with the external ID only
      const externalIdField = `${provider}_invoice_id`;
      const { error: updateError } = await supabase
        .from("user_invoices")
        .update({
          [externalIdField]: data.externalId
        })
        .eq("id", invoice.id);

      if (updateError) {
        throw new Error(`Failed to update invoice with ${provider} ID`);
      }

      // Update the integration's last sync time instead
      await supabase
        .from("accounting_integrations")
        .update({ last_sync_at: new Date().toISOString() })
        .eq("user_id", user.id)
        .eq("provider", provider);

      toast({
        title: "Invoice Synced",
        description: `Invoice #${invoice.invoiceNumber} synced to ${provider === 'xero' ? 'Xero' : 'MYOB'}`,
      });

      return { success: true, externalId: data.externalId };
    } catch (error) {
      console.error(`Error syncing invoice to ${provider}:`, error);
      toast({
        title: "Sync Failed",
        description: error instanceof Error ? error.message : `Error syncing to ${provider === 'xero' ? 'Xero' : 'MYOB'}`,
        variant: "destructive",
      });
      return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    } finally {
      setIsSyncing(false);
    }
  };

  const refreshIntegrations = () => {
    fetchIntegrations();
  };

  const hasActiveIntegration = (provider: AccountingProvider): boolean => {
    return integrations.some(i => i.provider === provider && i.status === "active");
  };

  return {
    integrations,
    isLoading,
    isSyncing,
    connectXero,
    connectMyob,
    disconnectIntegration,
    syncInvoice,
    refreshIntegrations,
    hasActiveIntegration
  };
};
