
// EmailDesigner props separated into its own file for better organization
export interface EmailDesignerProps {
  initialTemplate?: {
    name: string;
    subject: string;
    content: string;
  };
  onSave: (template: { name: string; subject: string; content: string }) => Promise<boolean>;
  mode: 'template' | 'campaign';
  onCancel?: () => void;
}

// EmailTesting props
export interface EmailTestingProps {
  emailSubject: string;
  emailContent: string;
  onSendTest: (recipients: string[], options: any) => Promise<{ success: boolean; message?: string }>;
  isSubmitting: boolean;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}
