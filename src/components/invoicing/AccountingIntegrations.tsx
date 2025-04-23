
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, ExternalLink, LinkIcon, RefreshCw, X } from "lucide-react";
import { useAccountingIntegrations } from "@/hooks/invoicing/useAccountingIntegrations";
import { useXeroWebhook } from "@/hooks/invoicing/useXeroWebhook";
import { Skeleton } from "@/components/ui/skeleton";
import { AccountingProvider } from "@/types/accounting";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";

const AccountingIntegrations: React.FC = () => {
  const {
    integrations,
    isLoading,
    connectXero,
    disconnectIntegration,
    hasActiveIntegration,
    refreshIntegrations
  } = useAccountingIntegrations();

  const { getWebhookUrl } = useXeroWebhook();
  const [webhookUrl, setWebhookUrl] = useState<string>("");
  const [isLoadingWebhook, setIsLoadingWebhook] = useState<boolean>(false);

  useEffect(() => {
    const fetchWebhookUrl = async () => {
      if (hasActiveIntegration('xero')) {
        setIsLoadingWebhook(true);
        const url = await getWebhookUrl();
        setWebhookUrl(url);
        setIsLoadingWebhook(false);
      }
    };

    fetchWebhookUrl();
  }, [integrations]);

  const copyWebhookUrl = () => {
    if (webhookUrl) {
      navigator.clipboard.writeText(webhookUrl);
      toast({
        title: "Copied!",
        description: "Webhook URL copied to clipboard",
      });
    }
  };

  const renderIntegrationStatus = (provider: AccountingProvider) => {
    const integration = integrations.find(i => i.provider === provider);
    
    if (!integration) {
      return (
        <Button onClick={() => provider === 'xero' ? connectXero() : null} className="ml-auto">
          Connect
        </Button>
      );
    }
    
    return (
      <div className="flex items-center gap-2 ml-auto">
        {integration.status === 'active' ? (
          <>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <Check size={12} className="mr-1" /> Connected
            </Badge>
            {integration.lastSyncAt && (
              <span className="text-xs text-muted-foreground">
                Synced {formatDistanceToNow(new Date(integration.lastSyncAt), { addSuffix: true })}
              </span>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => disconnectIntegration(provider)}
              className="ml-2"
            >
              <X size={12} className="mr-1" /> Disconnect
            </Button>
          </>
        ) : (
          <>
            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
              Disconnected
            </Badge>
            <Button onClick={() => provider === 'xero' ? connectXero() : null} size="sm">
              Reconnect
            </Button>
          </>
        )}
      </div>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Accounting Integrations</CardTitle>
          <CardDescription>
            Connect your accounting software to sync invoices automatically
          </CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={refreshIntegrations} className="gap-1">
          <RefreshCw size={14} />
          Refresh
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoading ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-24" />
            </div>
            <div className="flex items-center justify-between">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-24" />
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between py-2 border-b">
              <div className="flex items-center gap-3">
                <div className="bg-muted rounded-md p-2 flex items-center justify-center w-10 h-10">
                  <svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="#13B5EA">
                    <path d="M93.2,55.7c-0.5,2.4-0.7,4.9-1.3,7.3c-1.8,6.8-5.6,12-12.5,14.4c-1.4,0.5-2.9,0.8-4.4,0.8c-9.2,0.1-18.4,0.1-27.6,0.1
                         c-1,0-2,0.1-3.2,0.2c1.4,7.5,2.8,14.8,4.2,22.3c-15.7,0-31.4,0-47.4,0c-1.3-7.4-2.6-14.7-4-22.3c-0.4,0-1,0-1.5,0
                         c0.5-3,1-5.9,1.5-8.9c0.5-3.1,1-6.2,1.5-9.3c0.4-2.4,0.7-4.9,1.2-7.3c1.7-8.3,6.1-14.4,14.7-16.7c1.2-0.3,2.5-0.4,3.8-0.4
                         c0.8,0,1.2-0.3,1.5-1c1.2-3.1,2.5-6.1,3.7-9.2c1.9-4.7,4.1-9.2,7.7-12.9c3.5-3.6,7.6-5.5,12.6-5.5c6.2,0,12.3,0,18.5,0
                         c5.7,0.1,10.1,2.7,13.4,7.3c4,5.5,6.3,11.8,8.1,18.3c0.1,0.5,0.5,1.1,0.9,1.3c7.2,2.8,11.5,8.1,12.9,15.6
                         C93.7,50.9,93.4,53.3,93.2,55.7z M45.3,21.8c-2.6,6.4-4.9,12.9-7.3,19.3c10.4,0,20.5,0,30.9,0c-0.3-1.2-0.4-2.2-0.7-3.2
                         c-1.5-5.5-3-10.9-6.2-15.6c-1.1-1.7-2.5-3-4.5-3c-4,0-8,0-11.9,0C47.7,19.2,45.9,19.9,45.3,21.8z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium">Xero</h3>
                  <p className="text-sm text-muted-foreground">Sync invoices with Xero</p>
                </div>
              </div>
              {renderIntegrationStatus('xero')}
            </div>
            
            {hasActiveIntegration('xero') && (
              <div className="bg-gray-50 rounded-md p-4 mb-4">
                <h4 className="font-medium text-sm mb-2 flex items-center">
                  <LinkIcon size={14} className="mr-1" /> Webhook Configuration
                </h4>
                <p className="text-xs text-muted-foreground mb-2">
                  Configure this URL in your Xero Developer Dashboard to receive payment status updates:
                </p>
                <div className="flex items-center gap-2">
                  {isLoadingWebhook ? (
                    <Skeleton className="h-9 w-full" />
                  ) : (
                    <Input 
                      value={webhookUrl} 
                      readOnly 
                      className="text-xs font-mono bg-gray-100"
                    />
                  )}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={copyWebhookUrl} 
                    disabled={isLoadingWebhook || !webhookUrl}
                  >
                    Copy
                  </Button>
                </div>
              </div>
            )}
            
            <div className="flex items-center justify-between py-2 border-b">
              <div className="flex items-center gap-3">
                <div className="bg-muted rounded-md p-2 flex items-center justify-center w-10 h-10">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM15 12L10 8V16L15 12Z" fill="#731BCF"/>
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium">MYOB</h3>
                  <p className="text-sm text-muted-foreground">Sync invoices with MYOB (Coming soon)</p>
                </div>
              </div>
              <Badge variant="secondary">Coming Soon</Badge>
            </div>

            <div className="text-sm text-muted-foreground mt-6 bg-muted p-3 rounded">
              <p className="font-medium mb-2">How accounting sync works:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Connect your accounting system using the buttons above</li>
                <li>When creating or updating invoices in WorkshopBase, select "Sync to accounting"</li>
                <li>Invoices will sync automatically, and payment status will update both ways</li>
                <li>You can manually trigger sync from the invoice details page</li>
              </ol>
            </div>

            <div className="text-sm text-muted-foreground mt-2">
              <p>
                Need help setting up? <a href="#" className="text-blue-600 hover:underline inline-flex items-center">
                  View documentation <ExternalLink size={12} className="ml-1" />
                </a>
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default AccountingIntegrations;
