
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { 
  SendgridEmailOptions, 
  EmailRecipient, 
  SendEmailResult 
} from '@/components/email-marketing/types.d';

export function useSendgridEmail() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  /**
   * Send an email using the SendGrid API
   */
  const sendEmail = async (
    to: string | EmailRecipient,
    options: SendgridEmailOptions
  ): Promise<SendEmailResult> => {
    // For now, this is a mock implementation
    setIsLoading(true);
    setError(null);

    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('Sending email to:', to);
        console.log('Email options:', options);
        
        setIsLoading(false);
        resolve({ success: true });
      }, 1000);
    });
  };

  /**
   * Send a test email
   */
  const sendTestEmail = async (
    recipient: string,
    subject: string,
    content: string
  ): Promise<SendEmailResult> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await sendEmail(recipient, {
        to: recipient,
        subject,
        html: content,
        text: "This is a test email"
      });

      if (result.success) {
        toast({
          title: "Test email sent",
          description: "Your test email has been sent successfully",
        });
      } else {
        throw result.error || new Error("Failed to send test email");
      }

      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error sending test email');
      setError(error);
      
      toast({
        title: 'Failed to send test email',
        description: error.message,
        variant: 'destructive',
      });
      
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    sendEmail,
    sendTestEmail
  };
}
