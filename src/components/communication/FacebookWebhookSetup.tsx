import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const WEBHOOK_URL = "https://qyjjbpyqxwrluhymvshn.supabase.co/functions/v1/facebook-webhook";
const VERIFY_TOKEN = "wsb_fb_hook_a7d93bf52c14e9f8";

const FacebookWebhookSetup: React.FC = () => {
  const { toast } = useToast();

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Facebook Webhook Setup</CardTitle>
        <CardDescription>
          Configure these settings in your Facebook App to enable message receiving
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Callback URL</label>
          <div className="flex gap-2">
            <Input value={WEBHOOK_URL} readOnly className="font-mono text-xs" />
            <Button
              variant="outline"
              size="icon"
              onClick={() => copyToClipboard(WEBHOOK_URL, "Callback URL")}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Verify Token</label>
          <div className="flex gap-2">
            <Input value={VERIFY_TOKEN} readOnly className="font-mono text-xs" />
            <Button
              variant="outline"
              size="icon"
              onClick={() => copyToClipboard(VERIFY_TOKEN, "Verify Token")}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="pt-4 space-y-2">
          <h4 className="text-sm font-medium">Setup Instructions:</h4>
          <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
            <li>Go to your Facebook App Dashboard</li>
            <li>Navigate to Messenger → Settings</li>
            <li>In the Webhooks section, click "Add Callback URL"</li>
            <li>Paste the Callback URL and Verify Token from above</li>
            <li>Subscribe to these webhook fields: messages, messaging_postbacks</li>
            <li>Click "Verify and Save"</li>
          </ol>
          
          <Button
            variant="outline"
            className="w-full mt-4"
            onClick={() => window.open('https://developers.facebook.com/apps', '_blank')}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Open Facebook App Dashboard
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default FacebookWebhookSetup;
