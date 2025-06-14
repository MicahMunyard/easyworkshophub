
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { saveEmailTemplate, getEmailTemplates } from "./utils/supabaseUtils";

interface EmailTemplateInput {
  name: string;
  subject: string;
  content: string;
  category: string;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  category: string;
  created_at: string;
  updated_at: string;
  is_default?: boolean;
  template_type?: string;
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
      
      // Map the database fields to our EmailTemplate interface
      const mappedTemplates: EmailTemplate[] = fetchedTemplates.map(template => ({
        id: template.id,
        name: template.name,
        subject: template.subject,
        content: template.body || '', // Map 'body' from DB to 'content' in our interface
        category: template.template_type || 'other', // Map 'template_type' to 'category'
        created_at: template.created_at,
        updated_at: template.updated_at || template.created_at,
        is_default: template.is_default,
        template_type: template.template_type
      }));
      
      setTemplates(mappedTemplates);
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

  const createTemplate = async (templateInput: EmailTemplateInput) => {
    if (!user) return null;
    
    try {
      const { name, subject, content, category } = templateInput;
      
      const templateId = await saveEmailTemplate(
        user.id,
        name,
        subject,
        content,
        category,
        false // isDefault
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
