
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useSendgridEmail } from "@/hooks/email/useSendgridEmail";

const testEmailSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type TestEmailFormData = z.infer<typeof testEmailSchema>;

interface TestEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  templateId?: string;
  campaignSubject?: string;
  campaignName?: string;
}

export function TestEmailModal({
  isOpen,
  onClose,
  templateId,
  campaignSubject,
  campaignName
}: TestEmailModalProps) {
  const [isSending, setIsSending] = useState(false);
  const { sendEmail } = useSendgridEmail();

  const form = useForm<TestEmailFormData>({
    resolver: zodResolver(testEmailSchema),
    defaultValues: {
      email: "",
    },
  });

  const handleSendTest = async (data: TestEmailFormData) => {
    if (!templateId) {
      form.setError("email", { message: "No template selected" });
      return;
    }

    setIsSending(true);
    
    try {
      // Make sure to properly pass the email address as the 'to' parameter
      const result = await sendEmail(
        { email: data.email, name: "Test Recipient" }, // Explicit email recipient object format
        {
          subject: `[TEST] ${campaignSubject || "Email Campaign"}`,
          templateId: templateId,
          dynamicTemplateData: {
            campaign_name: campaignName || "Test Campaign",
            preview_text: "This is a test email",
            current_date: new Date().toLocaleDateString(),
          }
        }
      );

      if (result.success) {
        form.reset();
        onClose();
      } else {
        throw new Error(result.error?.message || "Failed to send test email");
      }
    } catch (error) {
      console.error("Error sending test email:", error);
      form.setError("email", { 
        message: error instanceof Error ? error.message : "Failed to send test email" 
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Send Test Email</DialogTitle>
          <DialogDescription>
            Send a test version of this campaign to verify how it will look.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSendTest)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email address</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="you@example.com"
                      {...field}
                      autoComplete="email"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter className="mt-6 gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={onClose} disabled={isSending}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSending || !templateId}>
                {isSending ? "Sending..." : "Send Test"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
