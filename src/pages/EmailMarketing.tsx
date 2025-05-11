
import React, { useState } from "react";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, FileText, Clock, BarChart3, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import EmailCampaignBuilder from "@/components/email-marketing/EmailCampaignBuilder";
import EmailTemplateList from "@/components/email-marketing/EmailTemplateList";
import EmailAutomations from "@/components/email-marketing/EmailAutomations";
import EmailAnalytics from "@/components/email-marketing/EmailAnalytics";
import EmailCampaignHistory from "@/components/email-marketing/EmailCampaignHistory";
import { useEmailMarketing } from "@/components/email-marketing/useEmailMarketing";
import { useSendgrid } from "@/hooks/email/useSendgrid";

const EmailMarketing = () => {
  const [activeTab, setActiveTab] = useState("campaigns");
  
  const { 
    campaigns, 
    templates, 
    automations, 
    analytics, 
    isLoading,
    createCampaign,
    createTemplate,
    createAutomation,
    isEmailConfigured
  } = useEmailMarketing();

  const { isConfigured: isSendgridConfigured } = useSendgrid();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Email Marketing</h1>
        <p className="text-muted-foreground">
          Design and manage email campaigns for your customers.
        </p>
      </div>

      {!isSendgridConfigured && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Email sending through SendGrid is configured but not active. Your templates and campaigns will be saved, but you won't be able to send emails.
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="flex overflow-x-auto">
          <TabsTrigger value="campaigns" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            <span>Campaigns</span>
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span>Templates</span>
          </TabsTrigger>
          <TabsTrigger value="automations" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>Automations</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span>Analytics</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>New Campaign</CardTitle>
              <CardDescription>
                Create and send a new email campaign to your customers.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EmailCampaignBuilder 
                templates={templates}
                onSave={createCampaign}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Campaign History</CardTitle>
              <CardDescription>
                View your past and scheduled email campaigns.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EmailCampaignHistory
                campaigns={campaigns}
                isLoading={isLoading}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Email Templates</CardTitle>
              <CardDescription>
                Manage and create email templates for your campaigns.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EmailTemplateList 
                templates={templates} 
                isLoading={isLoading}
                onSave={createTemplate}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Email Automations</CardTitle>
              <CardDescription>
                Set up recurring emails and automated workflows.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EmailAutomations 
                automations={automations} 
                templates={templates}
                isLoading={isLoading}
                onSave={createAutomation}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Campaign Performance</CardTitle>
                  <CardDescription>
                    Track email opens, clicks, and conversion rates.
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                  Refresh Data
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <EmailAnalytics 
                analytics={analytics}
                isLoading={isLoading} 
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EmailMarketing;
