
import React, { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { 
  AlertCircle, 
  Check, 
  Copy, 
  Eye, 
  EyeOff, 
  Info, 
  Shield, 
  Mail, 
  RotateCw
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SendgridFormValues, SendgridConfigProps } from "./types";

// Form schema with validation
const sendgridFormSchema = z.object({
  apiKey: z.string().min(1, "API Key is required"),
  senderName: z.string().min(1, "Sender name is required"),
  senderEmail: z.string().email("Invalid email address"),
  replyToEmail: z.string().email("Invalid email address").optional(),
  enableTracking: z.boolean().default(true),
  enableUnsubscribeFooter: z.boolean().default(true),
});

const SendgridConfig: React.FC<SendgridConfigProps> = ({
  onSaveConfig,
  onTestConnection,
  existingConfig
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [activeTab, setActiveTab] = useState("general");

  const form = useForm<SendgridFormValues>({
    resolver: zodResolver(sendgridFormSchema),
    defaultValues: {
      apiKey: existingConfig?.apiKey || "",
      senderName: existingConfig?.senderName || "",
      senderEmail: existingConfig?.senderEmail || "",
      replyToEmail: existingConfig?.replyToEmail || "",
      enableTracking: existingConfig?.enableTracking !== false,
      enableUnsubscribeFooter: existingConfig?.enableUnsubscribeFooter !== false,
    },
  });

  useEffect(() => {
    if (existingConfig) {
      form.reset({
        apiKey: existingConfig.apiKey || "",
        senderName: existingConfig.senderName || "",
        senderEmail: existingConfig.senderEmail || "",
        replyToEmail: existingConfig.replyToEmail || "",
        enableTracking: existingConfig.enableTracking,
        enableUnsubscribeFooter: existingConfig.enableUnsubscribeFooter,
      });
    }
  }, [existingConfig, form]);

  // Check if form has been changed
  const hasChanges = () => {
    if (!existingConfig) return true;
    
    const values = form.getValues();
    return (
      values.apiKey !== existingConfig.apiKey ||
      values.senderName !== existingConfig.senderName ||
      values.senderEmail !== existingConfig.senderEmail ||
      values.replyToEmail !== existingConfig.replyToEmail ||
      values.enableTracking !== existingConfig.enableTracking ||
      values.enableUnsubscribeFooter !== existingConfig.enableUnsubscribeFooter
    );
  };

  // Copy API key to clipboard
  const copyApiKey = () => {
    const apiKey = form.getValues("apiKey");
    navigator.clipboard.writeText(apiKey);
  };

  // Test the SendGrid connection
  const testConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    
    try {
      const result = await onTestConnection();
      setTestResult(result);
    } catch (error) {
      setTestResult({
        success: false,
        message: "Connection test failed due to an error"
      });
    } finally {
      setIsTesting(false);
    }
  };

  // Submit the form
  const onSubmit = async (data: SendgridFormValues) => {
    setIsSubmitting(true);
    
    try {
      const success = await onSaveConfig(data);
      if (success) {
        setTestResult({
          success: true,
          message: "Configuration saved successfully"
        });
      } else {
        setTestResult({
          success: false,
          message: "Failed to save configuration"
        });
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: "An error occurred while saving configuration"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>SendGrid Configuration</CardTitle>
              <CardDescription>
                Configure SendGrid to send marketing emails to your customers
              </CardDescription>
            </div>
            {existingConfig?.isConfigured && (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <Check className="h-3 w-3 mr-1" /> Configured
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="general">General</TabsTrigger>
                  <TabsTrigger value="sender">Sender Settings</TabsTrigger>
                  <TabsTrigger value="advanced">Advanced</TabsTrigger>
                </TabsList>
                
                <TabsContent value="general" className="space-y-4 pt-4">
                  <FormField
                    control={form.control}
                    name="apiKey"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SendGrid API Key</FormLabel>
                        <div className="flex">
                          <FormControl>
                            <div className="relative flex-1">
                              <Input
                                type={showApiKey ? "text" : "password"}
                                placeholder="Enter your SendGrid API key"
                                {...field}
                                className="pr-20"
                              />
                              <div className="absolute inset-y-0 right-0 flex items-center pr-2 space-x-1">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0"
                                  onClick={() => setShowApiKey(!showApiKey)}
                                >
                                  {showApiKey ? (
                                    <EyeOff className="h-4 w-4" />
                                  ) : (
                                    <Eye className="h-4 w-4" />
                                  )}
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0"
                                  onClick={copyApiKey}
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </FormControl>
                        </div>
                        <FormDescription>
                          Your SendGrid API key is used to authenticate with the SendGrid API.{" "}
                          <a
                            href="https://app.sendgrid.com/settings/api_keys"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary underline"
                          >
                            Get your API key from SendGrid
                          </a>
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex flex-col md:flex-row md:items-center gap-4 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={testConnection}
                      disabled={isTesting || !form.getValues("apiKey")}
                      className="flex items-center gap-2"
                    >
                      {isTesting ? (
                        <>
                          <RotateCw className="h-4 w-4 animate-spin" />
                          Testing Connection...
                        </>
                      ) : (
                        <>
                          <Shield className="h-4 w-4" />
                          Test Connection
                        </>
                      )}
                    </Button>
                    
                    {testResult && (
                      <Alert
                        variant={testResult.success ? "default" : "destructive"}
                        className="mb-0"
                      >
                        {testResult.success ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <AlertCircle className="h-4 w-4" />
                        )}
                        <AlertDescription>{testResult.message}</AlertDescription>
                      </Alert>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="sender" className="space-y-4 pt-4">
                  <FormField
                    control={form.control}
                    name="senderName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sender Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Your Workshop Name"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          The name that will appear as the sender of your emails
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="senderEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sender Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="noreply@yourworkshop.com"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          The email address that will be used to send emails. You must verify this domain in SendGrid.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="replyToEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Reply-To Email (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="info@yourworkshop.com"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Email address for recipients to reply to. If not provided, the sender email will be used.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>
                
                <TabsContent value="advanced" className="space-y-4 pt-4">
                  <FormField
                    control={form.control}
                    name="enableTracking"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Enable Email Tracking</FormLabel>
                          <FormDescription>
                            Track open and click rates for your campaigns
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="enableUnsubscribeFooter"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Enable Unsubscribe Footer</FormLabel>
                          <FormDescription>
                            Add a footer to your emails with an unsubscribe link
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <div className="pt-4">
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        <p className="mb-2">To ensure high deliverability of your emails, we recommend setting up the following:</p>
                        <ul className="list-disc pl-4 text-sm space-y-1">
                          <li>Set up <strong>SPF</strong> and <strong>DKIM</strong> records for your domain</li>
                          <li>Verify your domain in SendGrid</li>
                          <li>Set up a dedicated IP address for your email sending</li>
                          <li>Warm up your IP address before sending high volumes</li>
                        </ul>
                        <p className="mt-2">
                          <a 
                            href="https://docs.sendgrid.com/ui/account-and-settings/how-to-set-up-domain-authentication"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary underline"
                          >
                            Learn more about SendGrid domain authentication
                          </a>
                        </p>
                      </AlertDescription>
                    </Alert>
                  </div>
                </TabsContent>
              </Tabs>
              
              <div className="flex justify-end pt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting || !hasChanges()}
                >
                  {isSubmitting ? "Saving..." : "Save Configuration"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      {/* Quick Setup Guide Card */}
      <Card>
        <CardHeader>
          <CardTitle>SendGrid Setup Guide</CardTitle>
          <CardDescription>
            Follow these steps to set up SendGrid for your email marketing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="space-y-4 list-decimal pl-5">
            <li className="text-sm">
              <div className="font-medium">Create a SendGrid account</div>
              <p className="text-muted-foreground">
                Sign up for a SendGrid account at{" "}
                <a
                  href="https://sendgrid.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline"
                >
                  sendgrid.com
                </a>
              </p>
            </li>
            <li className="text-sm">
              <div className="font-medium">Create an API key</div>
              <p className="text-muted-foreground">
                Go to Settings → API Keys → Create API Key. Give it a name and select "Full Access" or "Restricted Access"
                with Mail Send permissions.
              </p>
            </li>
            <li className="text-sm">
              <div className="font-medium">Verify your domain</div>
              <p className="text-muted-foreground">
                Go to Settings → Sender Authentication → Verify a Domain to add DNS records that prove you own your domain.
              </p>
            </li>
            <li className="text-sm">
              <div className="font-medium">Create a verified sender</div>
              <p className="text-muted-foreground">
                Go to Settings → Sender Authentication → Verify a Single Sender to create an email address that can send emails.
              </p>
            </li>
            <li className="text-sm">
              <div className="font-medium">Enter details in this form</div>
              <p className="text-muted-foreground">
                Enter your API key and sender details in the form above and save your configuration.
              </p>
            </li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
};

export default SendgridConfig;
