
import React, { useState } from "react";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, FileText, Clock, BarChart3, Settings, Plus, Edit } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import EmailCampaignBuilder from "@/components/email-marketing/EmailCampaignBuilder";
import EmailTemplateList from "@/components/email-marketing/EmailTemplateList";
import EmailAutomations from "@/components/email-marketing/EmailAutomations";
import EnhancedEmailAnalytics from "@/components/email-marketing/EnhancedEmailAnalytics";
import EmailCampaignHistory from "@/components/email-marketing/EmailCampaignHistory";
import { useEmailMarketing } from "@/components/email-marketing/useEmailMarketing";
import { EmailErrorProvider, EmailErrorDisplay } from "@/components/email-marketing/EmailErrorProvider";
import { useNavigate } from "react-router-dom";
import SendgridConfig from "@/components/email-marketing/SendgridConfig";

const EmailMarketing = () => {
  const [activeTab, setActiveTab] = useState("campaigns");
  const navigate = useNavigate();
  
  const { 
    campaigns, 
    templates, 
    automations, 
    analytics, 
    isLoading,
    createCampaign,
    createTemplate,
    createAutomation,
    isEmailConfigured,
    exportAnalytics,
    sendTestEmail
  } = useEmailMarketing();

  // Handle navigation to email designer
  const handleDesignEmail = () => {
    // Navigate to the email designer page for campaigns
    navigate("/email-designer/campaign");
  };
  
  // Handle navigation to template designer
  const handleDesignTemplate = () => {
    navigate("/email-designer/template");
  };

  // Check if SendGrid is configured and show setup notice if needed
  if (!isEmailConfigured) {
    return (
      <div className="container mx-auto py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Email Marketing</h1>
          <p className="text-muted-foreground">
            Send professional email campaigns to your customers
          </p>
        </div>
        
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 text-center">
          <h2 className="text-lg font-medium text-amber-800 mb-2">SendGrid Integration Required</h2>
          <p className="text-amber-700 mb-4">
            To use email marketing features, you need to configure your SendGrid integration.
          </p>
          <Button 
            onClick={() => setActiveTab("settings")}
            className="bg-amber-600 hover:bg-amber-700"
          >
            Set Up SendGrid Integration
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <EmailErrorProvider>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Email Marketing</h1>
            <p className="text-muted-foreground">
              Design and manage email campaigns for your customers
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setActiveTab("settings")}
              className="flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              Settings
            </Button>
            <Button
              onClick={handleDesignEmail}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Create Campaign
            </Button>
          </div>
        </div>

        {/* Display any email-related errors */}
        <EmailErrorDisplay />
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-5 mb-6">
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
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="campaigns" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Email Campaigns</CardTitle>
                    <CardDescription>
                      Create and send email campaigns to your customers
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      onClick={handleDesignEmail}
                      className="flex items-center gap-2"
                    >
                      <Edit className="h-4 w-4" /> Design Email
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <EmailCampaignHistory
                  campaigns={campaigns}
                  isLoading={isLoading}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Send Campaign</CardTitle>
                <CardDescription>
                  Configure and send an email campaign to your customers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <EmailCampaignBuilder 
                  templates={templates}
                  onSave={createCampaign}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Email Templates</CardTitle>
                    <CardDescription>
                      Manage and create reusable email templates
                    </CardDescription>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={handleDesignTemplate}
                    className="flex items-center gap-2"
                  >
                    <Edit className="h-4 w-4" /> Design Template
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <EmailTemplateList 
                  templates={templates} 
                  isLoading={isLoading}
                  onSave={createTemplate}
                  onTestEmail={sendTestEmail}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="automations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Email Automations</CardTitle>
                <CardDescription>
                  Set up automated email sequences for your customers
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
                      Track email opens, clicks, and engagement metrics
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                    Refresh Data
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <EnhancedEmailAnalytics 
                  analytics={analytics}
                  isLoading={isLoading}
                  exportAnalytics={exportAnalytics}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Email Settings</CardTitle>
                <CardDescription>
                  Configure your SendGrid integration and email preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SendgridConfig />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </EmailErrorProvider>
  );
};

export default EmailMarketing;
