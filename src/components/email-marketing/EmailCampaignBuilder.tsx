
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
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, SendIcon, TestTube } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { TestEmailModal } from "./TestEmailModal";

// Form validation schema
const campaignSchema = z.object({
  name: z.string().min(1, "Campaign name is required"),
  subject: z.string().min(1, "Subject line is required"),
  template_id: z.string().min(1, "Please select a template"),
  recipientSegment: z.enum(["all", "segment1", "segment2"]),
  schedule: z.boolean().default(false),
  scheduled_for: z.string().optional(),
  testEmail: z.string().email("Invalid email address").optional().or(z.literal(""))
});

type CampaignFormData = z.infer<typeof campaignSchema>;

const EmailCampaignBuilder: React.FC<EmailCampaignBuilderProps> = ({ templates, onSave }) => {
  const [date, setDate] = useState<Date>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testModalOpen, setTestModalOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<CampaignFormData>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      name: "",
      subject: "",
      template_id: "",
      recipientSegment: "all",
      schedule: false,
      scheduled_for: "",
      testEmail: ""
    }
  });

  const { watch, setValue } = form;
  const selectedTemplateId = watch("template_id");
  const scheduleEnabled = watch("schedule");
  const campaignSubject = watch("subject");
  const campaignName = watch("name");

  // Find the selected template
  const selectedTemplate = templates.find(t => t.id === selectedTemplateId);

  // Update subject when template changes
  useEffect(() => {
    if (selectedTemplate) {
      setValue("subject", selectedTemplate.subject);
    }
  }, [selectedTemplate, setValue]);

  // Update scheduled date when date picker changes
  useEffect(() => {
    if (date) {
      setValue("scheduled_for", format(date, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"));
    }
  }, [date, setValue]);
  
  const handleSubmit = async (formData: CampaignFormData) => {
    setIsSubmitting(true);
    
    try {
      if (!selectedTemplate) {
        toast({
          title: "Template not found",
          description: "Please select a valid email template",
          variant: "destructive"
        });
        return;
      }
      
      const campaignData = {
        name: formData.name,
        subject: formData.subject,
        template_id: formData.template_id,
        scheduled_for: formData.schedule ? formData.scheduled_for : undefined,
        audience_type: formData.recipientSegment === "all" ? "all" : "segment" as "all" | "segment",
        send_immediately: !formData.schedule,
        segment_ids: formData.recipientSegment !== "all" ? [formData.recipientSegment] : undefined
      };
      
      const success = await onSave(campaignData);
      
      if (success) {
        toast({
          title: "Campaign created",
          description: formData.schedule ? "Your campaign has been scheduled" : "Your campaign is being sent",
        });
        
        form.reset({
          name: "",
          subject: "",
          template_id: "",
          recipientSegment: "all",
          schedule: false,
          scheduled_for: "",
          testEmail: ""
        });
        setDate(undefined);
      }
    } catch (error) {
      console.error("Error creating campaign:", error);
      toast({
        title: "Failed to create campaign",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openTestModal = () => {
    if (!selectedTemplateId) {
      toast({
        title: "Template required",
        description: "Please select a template before sending a test",
        variant: "destructive"
      });
      return;
    }
    setTestModalOpen(true);
  };

  if (templates.length === 0 && !isSubmitting) {
    return (
      <div className="text-center py-8">
        <p className="mb-4">You need to create at least one template before creating a campaign.</p>
        <Button onClick={() => window.location.href = "/email-designer/template"}>
          Create Your First Template
        </Button>
      </div>
    );
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Campaign Name</FormLabel>
                <FormControl>
                  <Input placeholder="Spring Service Special" {...field} />
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
                <FormLabel>Select Template</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
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
            name="subject"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Subject Line</FormLabel>
                <FormControl>
                  <Input placeholder="Special offer inside!" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="recipientSegment"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Recipients</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
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

          <FormField
            control={form.control}
            name="schedule"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                    className="h-4 w-4 mt-1"
                  />
                </FormControl>
                <div>
                  <FormLabel className="font-medium">Schedule Campaign</FormLabel>
                  <p className="text-sm text-muted-foreground">
                    Select a future date and time to send this campaign
                  </p>
                </div>
              </FormItem>
            )}
          />

          {scheduleEnabled && (
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
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={openTestModal} 
              disabled={!selectedTemplateId || isSubmitting}
              className="flex items-center gap-2"
            >
              <TestTube className="h-4 w-4" />
              Test Email
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting} 
              className="flex items-center gap-2"
            >
              <SendIcon className="h-4 w-4" />
              {isSubmitting ? "Creating..." : scheduleEnabled ? "Schedule Campaign" : "Send Campaign"}
            </Button>
          </div>
        </form>
      </Form>

      <TestEmailModal
        isOpen={testModalOpen}
        onClose={() => setTestModalOpen(false)}
        templateId={selectedTemplateId}
        campaignSubject={campaignSubject}
        campaignName={campaignName}
      />
    </>
  );
};

export default EmailCampaignBuilder;
