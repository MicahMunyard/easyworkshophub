
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { saveEmailTemplate, getEmailTemplates } from "./utils/supabaseUtils";

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  is_default: boolean;
  template_type: string;
}

export const useEmailTemplates = (templateType?: string) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTemplates = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    
    try {
      const fetchedTemplates = await getEmailTemplates(user.id, templateType);
      setTemplates(fetchedTemplates);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load email templates",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, templateType, toast]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const createTemplate = async (
    name: string, 
    subject: string, 
    body: string,
    type: string,
    isDefault: boolean = false
  ) => {
    if (!user) return null;
    
    try {
      const templateId = await saveEmailTemplate(
        user.id,
        name,
        subject,
        body,
        type,
        isDefault
      );
      
      if (templateId) {
        toast({
          title: "Template Created",
          description: "Email template has been saved successfully"
        });
        
        // Refresh templates
        fetchTemplates();
        
        return templateId;
      }
      
      throw new Error("Failed to create template");
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to create email template",
        variant: "destructive"
      });
      return null;
    }
  };

  return {
    templates,
    isLoading,
    createTemplate,
    refreshTemplates: fetchTemplates
  };
};
