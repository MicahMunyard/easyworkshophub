
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { AccountingProvider } from "@/types/accounting";
import { Invoice } from "@/types/invoice";
import { useAccountingIntegrations } from "@/hooks/invoicing/useAccountingIntegrations";
import { Loader2, RefreshCw } from "lucide-react";

interface SyncInvoiceButtonProps {
  invoice: Invoice;
  provider?: AccountingProvider;
  size?: "default" | "sm" | "lg" | "icon";
  variant?: "default" | "secondary" | "destructive" | "outline" | "ghost" | "link";
  className?: string;
}

const SyncInvoiceButton: React.FC<SyncInvoiceButtonProps> = ({
  invoice,
  provider = "xero",
  size = "default",
  variant = "outline",
  className = ""
}) => {
  const { syncInvoice, hasActiveIntegration, isSyncing } = useAccountingIntegrations();
  const [isLoading, setIsLoading] = useState(false);

  if (!hasActiveIntegration(provider)) {
    return null;
  }

  const handleSync = async () => {
    setIsLoading(true);
    await syncInvoice(invoice, provider);
    setIsLoading(false);
  };

  const isInvoiceSynced = Boolean(invoice[`${provider}InvoiceId`]);
  const xeroSyncedAt = invoice.lastSyncedAt;
  
  // Get display name based on provider
  const getProviderDisplayName = () => {
    if (provider === 'xero') {
      return 'Xero';
    } else if (provider === 'myob') {
      return 'MYOB';
    }
    return provider;
  };

  const formatSyncTime = (timestamp: string | undefined) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleString();
  };

  return (
    <Button
      size={size}
      variant={variant}
      className={`gap-1 ${className}`}
      onClick={handleSync}
      disabled={isLoading || isSyncing}
    >
      {isLoading || isSyncing ? (
        <>
          <Loader2 size={14} className="animate-spin" />
          <span>Syncing...</span>
        </>
      ) : (
        <>
          <RefreshCw size={14} />
          <span>
            {isInvoiceSynced 
              ? `Update in ${getProviderDisplayName()}` 
              : `Sync to ${getProviderDisplayName()}`}
          </span>
          {isInvoiceSynced && xeroSyncedAt && (
            <span className="text-xs text-muted-foreground ml-1">
              (Last synced: {formatSyncTime(xeroSyncedAt)})
            </span>
          )}
        </>
      )}
    </Button>
  );
};

export default SyncInvoiceButton;
