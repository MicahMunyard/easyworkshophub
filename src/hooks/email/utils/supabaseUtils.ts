
import { supabase } from "@/integrations/supabase/client";

// Get the URL for a Supabase Edge Function
export const getEdgeFunctionUrl = (functionName: string): string => {
  // Construct the edge function URL manually instead of using the protected url property
  const projectRef = "qyjjbpyqxwrluhymvshn"; // Get the project ref from supabase client URL
  return `https://${projectRef}.supabase.co/functions/v1/${functionName}`;
};

// Get user session token for authentication
export const getUserToken = async (): Promise<string | null> => {
  const { data: sessionData, error } = await supabase.auth.getSession();
  
  if (error || !sessionData.session) {
    console.error("Error getting user session:", error);
    return null;
  }
  
  return sessionData.session.access_token;
};

// Save or update an email template
export const saveEmailTemplate = async (
  userId: string,
  name: string,
  subject: string,
  body: string,
  templateType: string,
  isDefault: boolean = false
): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from('email_templates')
      .insert({
        user_id: userId,
        name: name,
        subject: subject,
        body: body,
        template_type: templateType,
        is_default: isDefault,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select('id')
      .single();
    
    if (error) {
      console.error("Error saving email template:", error);
      return null;
    }
    
    return data.id;
  } catch (error) {
    console.error("Error in saveEmailTemplate:", error);
    return null;
  }
};

// Get email templates for a user
export const getEmailTemplates = async (userId: string, templateType?: string) => {
  try {
    let query = supabase
      .from('email_templates')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
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
    console.error("Error in getEmailTemplates:", error);
    return [];
  }
};
