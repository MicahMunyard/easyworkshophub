
import React, { useState, useEffect } from "react";
import { EmailCampaignBuilderProps } from "./types";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSendgridEmail } from "@/hooks/email/useSendgridEmail";
import { useForm } from "react-hook-form";

interface FormData {
  name: string;
  subject: string;
  template_id: string;
  content: string;
  recipient_segments: string[];
  scheduled_for: string;
  schedule: boolean;
  testEmail: string;
}

const EmailCampaignBuilder: React.FC<EmailCampaignBuilderProps> = ({ templates, onSave }) => {
  const [date, setDate] = useState<Date>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const { toast } = useToast();
  const { sendEmail, getWorkshopEmail } = useSendgridEmail();
  const workshopEmail = getWorkshopEmail("Your Workshop");

  const form = useForm<FormData>({
    defaultValues: {
      name: "",
      subject: "",
      template_id: "",
      content: "",
      recipient_segments: ["all"],
      scheduled_for: "",
      schedule: false,
      testEmail: ""
    }
  });

  const { watch, setValue } = form;
  const formValues = watch();

  useEffect(() => {
    if (date) {
      setValue("scheduled_for", format(date, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"));
    }
  }, [date, setValue]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setValue(name as keyof FormData, value);
  };

  const handleSelectChange = (e: string) => {
    setValue("template_id", e);
  };

  const handleSegmentChange = (e: string[]) => {
    setValue("recipient_segments", e);
  };

  const handleScheduleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue("schedule", e.target.checked);
  };

  // Send a test email
  const sendTestEmail = async () => {
    if (!formValues.testEmail) return;
    
    setIsSendingTest(true);
    try {
      // Get the content from the selected template
      const selectedTemplate = templates.find(t => t.id === formValues.template_id);
      if (!selectedTemplate) throw new Error("Template not found");
      
      // Process template placeholders for preview
      const processedContent = selectedTemplate.content
        .replace(/{{customer_name}}/g, "Test Recipient")
        .replace(/{{vehicle}}/g, "Test Vehicle")
        .replace(/{{service_date}}/g, format(new Date(), "MMMM d, yyyy"))
        .replace(/{{workshop_name}}/g, "Your Workshop")
        .replace(/{{service_type}}/g, "Test Service")
        .replace(/{{expiry_date}}/g, format(new Date(new Date().setDate(new Date().getDate() + 30)), "MMMM d, yyyy"));
      
      // Send test email
      const result = await sendEmail(formValues.testEmail, {
        subject: `${formValues.subject} [TEST]`,
        html: processedContent,
        text: processedContent.replace(/<[^>]*>/g, ' '), // Simple HTML to text conversion
        to: formValues.testEmail // Added the required "to" property
      });
      
      if (!result.success) {
        throw new Error(result.error?.message || "Failed to send test email");
      }
    } catch (error) {
      console.error("Error sending test email:", error);
    } finally {
      setIsSendingTest(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent, isDraft: boolean = false) => {
    e.preventDefault();
    if (!formValues.name || !formValues.subject || !formValues.template_id) return;
    
    setIsSubmitting(true);
    try {
      await onSave({
        name: formValues.name,
        subject: formValues.subject,
        template_id: formValues.template_id,
        content: formValues.content,
        recipient_segments: formValues.recipient_segments,
        scheduled_for: formValues.schedule ? formValues.scheduled_for : undefined,
        from_email: workshopEmail, // Add the dynamic sender email
        sendImmediately: !formValues.schedule
      });
      
      // Reset form
      form.reset({
        name: "",
        subject: "",
        template_id: "",
        content: "",
        recipient_segments: ["all"],
        scheduled_for: "",
        schedule: false,
        testEmail: ""
      });
      setDate(undefined);
    } catch (error) {
      console.error("Error creating campaign:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Campaign Name</FormLabel>
              <FormControl>
                <Input placeholder="My First Campaign" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="subject"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subject</FormLabel>
              <FormControl>
                <Input placeholder="Special offer inside!" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="template_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Template</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a template" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content</FormLabel>
              <FormControl>
                <Textarea placeholder="Write your email content here." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="recipient_segments"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Recipients</FormLabel>
              <Select
                onValueChange={(value) => {
                  field.onChange([value]);
                }}
                defaultValue={field.value[0]}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a recipient segment" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="all">All Customers</SelectItem>
                  <SelectItem value="segment1">VIP Customers</SelectItem>
                  <SelectItem value="segment2">New Customers</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-center space-x-2">
          <FormField
            control={form.control}
            name="schedule"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Input
                    type="checkbox"
                    checked={field.value}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormLabel className="font-normal">Schedule Campaign</FormLabel>
              </FormItem>
            )}
          />

          {formValues.schedule && (
            <FormField
              control={form.control}
              name="scheduled_for"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Scheduled Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-[240px] pl-3 text-left font-normal",
                          !date && "text-muted-foreground"
                        )}
                      >
                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        disabled={(date) =>
                          date < new Date()
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        <FormField
          control={form.control}
          name="testEmail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Send Test Email To</FormLabel>
              <FormControl>
                <Input placeholder="test@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-between">
          <Button 
            type="button" 
            variant="secondary"
            onClick={sendTestEmail}
            disabled={isSendingTest}
          >
            {isSendingTest ? "Sending..." : "Send Test Email"}
          </Button>
          <div className="flex space-x-2">
            <Button type="submit" variant="outline" disabled={isSubmitting}>
              Save as Draft
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Create Campaign"}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
};

export default EmailCampaignBuilder;
