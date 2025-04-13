
import { supabase } from "@/integrations/supabase/client";

// Function to get the edge function URL
export const getEdgeFunctionUrl = (functionName: string): string => {
  // Get Supabase project URL from environment or constants
  const supabaseUrl = "https://qyjjbpyqxwrluhymvshn.supabase.co";

  // Return the edge function URL
  return `${supabaseUrl}/functions/v1/${functionName}`;
};

// Function to check if a user has an active email connection
export const hasValidEmailConnection = async (userId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('email_connections')
      .select('status')
      .eq('user_id', userId)
      .single();
    
    if (error || !data) {
      return false;
    }
    
    return data.status === 'connected';
  } catch (error) {
    console.error("Error checking email connection:", error);
    return false;
  }
};

// Save email template to database
export const saveEmailTemplate = async (
  userId: string,
  name: string,
  subject: string,
  body: string,
  templateType: string,
  isDefault = false
): Promise<string | null> => {
  try {
    // If setting as default, first unset any existing defaults of this type
    if (isDefault) {
      await supabase
        .from('email_templates')
        .update({ is_default: false })
        .eq('user_id', userId)
        .eq('template_type', templateType);
    }
    
    // Insert the new template
    const { data, error } = await supabase
      .from('email_templates')
      .insert({
        user_id: userId,
        name,
        subject,
        body,
        template_type: templateType,
        is_default: isDefault
      })
      .select('id')
      .single();
    
    if (error) {
      console.error("Error saving email template:", error);
      return null;
    }
    
    return data.id;
  } catch (error) {
    console.error("Error saving email template:", error);
    return null;
  }
};

// Get email templates for a user
export const getEmailTemplates = async (userId: string, templateType?: string) => {
  try {
    let query = supabase
      .from('email_templates')
      .select('*')
      .eq('user_id', userId);
    
    if (templateType) {
      query = query.eq('template_type', templateType);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error("Error fetching email templates:", error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error("Error fetching email templates:", error);
    return [];
  }
};
