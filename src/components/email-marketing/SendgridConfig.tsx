import React, { useState, useEffect } from "react";
import { SendgridConfigProps, SendgridFormValues } from "./types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useSendgrid } from "@/hooks/email/useSendgrid";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const formSchema = z.object({
  apiKey: z.string().min(1, {
    message: "API Key is required.",
  }),
  fromName: z.string().min(1, {
    message: "From Name is required.",
  }),
  fromEmail: z.string().email({
    message: "Please enter a valid email address.",
  }),
  senderName: z.string().optional(),
  senderEmail: z.string().email({
    message: "Please enter a valid email address.",
  }).optional(),
  replyToEmail: z.string().email({
    message: "Please enter a valid email address.",
  }).optional(),
  enableTracking: z.boolean().default(false),
  enableUnsubscribeFooter: z.boolean().default(false),
});

const SendgridConfig: React.FC<SendgridConfigProps> = ({ 
  isConfigured, 
  onSaveConfig, 
  onTestConnection, 
  existingConfig 
}) => {
  const [isTesting, setIsTesting] = useState(false);
  const { toast } = useToast();
  const { saveSendgridConfig, testSendgridConnection } = useSendgrid();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      apiKey: existingConfig?.apiKey || "",
      fromName: existingConfig?.fromName || "",
      fromEmail: existingConfig?.fromEmail || "",
      senderName: existingConfig?.senderName || "",
      senderEmail: existingConfig?.senderEmail || "",
      replyToEmail: existingConfig?.replyToEmail || "",
      enableTracking: existingConfig?.enableTracking || false,
      enableUnsubscribeFooter: existingConfig?.enableUnsubscribeFooter || false,
    },
  });
  
  useEffect(() => {
    if (existingConfig) {
      form.reset(existingConfig);
    }
  }, [existingConfig, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const configValues: SendgridFormValues = {
        apiKey: values.apiKey,
        fromName: values.fromName,
        fromEmail: values.fromEmail,
        senderName: values.senderName,
        senderEmail: values.senderEmail,
        replyToEmail: values.replyToEmail,
        enableTracking: values.enableTracking,
        enableUnsubscribeFooter: values.enableUnsubscribeFooter,
      };

      const success = await saveSendgridConfig(configValues);
      
      if (success) {
        toast({
          title: "Configuration saved",
          description: "Your Sendgrid configuration has been saved successfully",
        });
        
        if (onSaveConfig) {
          await onSaveConfig(configValues);
        }
      } else {
        toast({
          title: "Failed to save configuration",
          description: "There was an error saving your Sendgrid configuration",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Failed to save configuration",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    try {
      const values = form.getValues();
      const configValues: SendgridFormValues = {
        apiKey: values.apiKey,
        fromName: values.fromName,
        fromEmail: values.fromEmail,
        senderName: values.senderName,
        senderEmail: values.senderEmail,
        replyToEmail: values.replyToEmail,
        enableTracking: values.enableTracking,
        enableUnsubscribeFooter: values.enableUnsubscribeFooter,
      };

      const result = await testSendgridConnection(configValues);
      
      if (onTestConnection) {
        await onTestConnection(configValues);
      }
      
      if (result.success) {
        toast({
          title: "Connection successful",
          description: "Successfully connected to Sendgrid",
        });
      } else {
        toast({
          title: "Connection failed",
          description: result.message || "Failed to connect to Sendgrid",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Connection failed",
        description: error?.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sendgrid Configuration</CardTitle>
        <CardDescription>
          Configure your Sendgrid settings to send emails
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="apiKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>API Key</FormLabel>
                  <FormControl>
                    <Input placeholder="sk-..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="fromName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>From Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="fromEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>From Email</FormLabel>
                  <FormControl>
                    <Input placeholder="you@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="senderName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sender Name (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Sender Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="senderEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sender Email (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="sender@example.com" {...field} />
                  </FormControl>
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
                    <Input placeholder="replyto@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex items-center space-x-2">
              <FormField
                control={form.control}
                name="enableTracking"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel>Enable Tracking</FormLabel>
                  </FormItem>
                )}
              />
            </div>
            <div className="flex items-center space-x-2">
              <FormField
                control={form.control}
                name="enableUnsubscribeFooter"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel>Enable Unsubscribe Footer</FormLabel>
                  </FormItem>
                )}
              />
            </div>
            <div className="flex justify-between">
              <Button 
                type="button" 
                variant="secondary" 
                onClick={handleTestConnection} 
                disabled={isTesting}
              >
                {isTesting ? "Testing..." : "Test Connection"}
              </Button>
              <Button type="submit" disabled={isConfigured}>
                Save Configuration
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default SendgridConfig;
