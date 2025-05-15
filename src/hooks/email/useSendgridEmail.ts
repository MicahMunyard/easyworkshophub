
import { useState } from 'react';
import { sendgridService } from '@/services/sendgridService';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import type { EmailRecipient, SendgridEmailOptions, SendEmailResult } from '@/components/email-marketing/types.d';

export function useSendgridEmail() {
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  
  const sendEmail = async (recipient: EmailRecipient | string, options: SendgridEmailOptions): Promise<SendEmailResult> => {
    if (!user) {
      return {
        success: false,
        error: new Error('User must be authenticated to send emails')
      };
    }
    
    setIsSending(true);
    
    try {
      console.log("Sending email with options:", JSON.stringify(options, null, 2));
      
      // Format recipient if it's a string
      const formattedRecipient = typeof recipient === 'string' 
        ? { email: recipient, name: recipient.split('@')[0] } 
        : recipient;
      
      // Make sure 'to' field is present in options
      const enhancedOptions = {
        ...options,
        to: options.to || formattedRecipient.email
      };
      
      // Call the sendgrid service
      const result = await sendgridService.sendEmail(
        "Your Workshop", // Workshop name placeholder - in real app this would be from user config
        formattedRecipient,
        enhancedOptions,
        options.replyTo
      );
      
      if (result.success) {
        toast({
          title: 'Email sent',
          description: 'Your email has been sent successfully',
        });
      } else {
        throw result.error || new Error('Failed to send email');
      }
      
      return result;
    } catch (error) {
      console.error('Error sending email:', error);
      toast({
        title: 'Email failed',
        description: error instanceof Error ? error.message : 'Failed to send email',
        variant: 'destructive'
      });
      
      return {
        success: false,
        error: error instanceof Error ? error : new Error('Failed to send email')
      };
    } finally {
      setIsSending(false);
    }
  };
  
  return {
    sendEmail,
    isSending
  };
}
