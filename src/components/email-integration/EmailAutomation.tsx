
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AlertCircle, PlusCircle } from "lucide-react";

interface EmailAutomationProps {
  isConnected: boolean;
}

const EmailAutomation: React.FC<EmailAutomationProps> = ({ isConnected }) => {
  const [enabledRules, setEnabledRules] = useState({
    keywordDetection: true,
    serviceRecognition: true,
    dateTimeExtraction: true,
    customerInfoExtraction: true,
    vehicleInfoExtraction: true,
    autoResponder: false
  });

  const [autoResponse, setAutoResponse] = useState(
    "Thank you for your booking request. We've received your email and will process your booking shortly. If you need immediate assistance, please call us at {workshop_phone}.\n\nThanks,\n{workshop_name}"
  );

  const toggleRule = (rule: string) => {
    setEnabledRules(prev => ({
      ...prev,
      [rule]: !prev[rule as keyof typeof prev]
    }));
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Booking Detection Rules</CardTitle>
          <CardDescription>
            Configure how the system detects and processes booking emails
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isConnected && (
            <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mb-4">
              <div className="flex gap-2 text-amber-800">
                <AlertCircle className="h-5 w-5" />
                <p className="text-sm">You need to connect an email account first to use these features.</p>
              </div>
            </div>
          )}
          
          <div className="space-y-4">
            <div className="flex items-center justify-between space-y-0">
              <div className="space-y-0.5">
                <Label>Keyword Detection</Label>
                <p className="text-xs text-muted-foreground">
                  Detect booking requests based on keywords (e.g., "book", "appointment", "schedule")
                </p>
              </div>
              <Switch
                checked={enabledRules.keywordDetection}
                onCheckedChange={() => toggleRule('keywordDetection')}
                disabled={!isConnected}
              />
            </div>
            
            <div className="flex items-center justify-between space-y-0">
              <div className="space-y-0.5">
                <Label>Service Recognition</Label>
                <p className="text-xs text-muted-foreground">
                  Identify services requested in emails and match to your service menu
                </p>
              </div>
              <Switch
                checked={enabledRules.serviceRecognition}
                onCheckedChange={() => toggleRule('serviceRecognition')}
                disabled={!isConnected}
              />
            </div>
            
            <div className="flex items-center justify-between space-y-0">
              <div className="space-y-0.5">
                <Label>Date & Time Extraction</Label>
                <p className="text-xs text-muted-foreground">
                  Recognize dates and times mentioned for potential appointments
                </p>
              </div>
              <Switch
                checked={enabledRules.dateTimeExtraction}
                onCheckedChange={() => toggleRule('dateTimeExtraction')}
                disabled={!isConnected}
              />
            </div>
            
            <div className="flex items-center justify-between space-y-0">
              <div className="space-y-0.5">
                <Label>Customer Information Extraction</Label>
                <p className="text-xs text-muted-foreground">
                  Extract customer name, phone number, and other contact details
                </p>
              </div>
              <Switch
                checked={enabledRules.customerInfoExtraction}
                onCheckedChange={() => toggleRule('customerInfoExtraction')}
                disabled={!isConnected}
              />
            </div>
            
            <div className="flex items-center justify-between space-y-0">
              <div className="space-y-0.5">
                <Label>Vehicle Information Extraction</Label>
                <p className="text-xs text-muted-foreground">
                  Extract vehicle details from email content
                </p>
              </div>
              <Switch
                checked={enabledRules.vehicleInfoExtraction}
                onCheckedChange={() => toggleRule('vehicleInfoExtraction')}
                disabled={!isConnected}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Automatic Responses</CardTitle>
          <CardDescription>
            Configure automatic responses to booking request emails
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between space-y-0 pb-4">
            <div className="space-y-0.5">
              <Label>Enable Auto-Responder</Label>
              <p className="text-xs text-muted-foreground">
                Automatically send responses to booking emails
              </p>
            </div>
            <Switch
              checked={enabledRules.autoResponder}
              onCheckedChange={() => toggleRule('autoResponder')}
              disabled={!isConnected}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Response Template</Label>
            <Textarea
              placeholder="Enter your automatic response template..."
              className="min-h-[120px]"
              value={autoResponse}
              onChange={(e) => setAutoResponse(e.target.value)}
              disabled={!isConnected || !enabledRules.autoResponder}
            />
            <p className="text-xs text-muted-foreground">
              Available placeholders: {'{customer_name}'}, {'{workshop_name}'}, {'{workshop_phone}'}, {'{workshop_address}'}
            </p>
          </div>
          
          <div className="space-y-4 mt-4 pt-4 border-t">
            <div className="flex justify-between items-center">
              <Label>Email Templates</Label>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 gap-1"
                disabled={!isConnected}
              >
                <PlusCircle className="h-3.5 w-3.5" />
                Add Template
              </Button>
            </div>
            
            <div className="bg-muted/40 rounded-md p-6 text-center text-muted-foreground">
              No custom templates created yet
            </div>
          </div>
          
          <div className="flex justify-end pt-4">
            <Button
              disabled={!isConnected}
            >
              Save Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailAutomation;
