import { supabase } from "@/integrations/supabase/client";

// Function to get the edge function URL
export const getEdgeFunctionUrl = (functionName: string): string => {
  // Get Supabase project URL from the client
  const supabaseUrl = "https://qyjjbpyqxwrluhymvshn.supabase.co";

  // Return the edge function URL
  return `${supabaseUrl}/functions/v1/${functionName}`;
};

// Function to check if a user has an active email connection
export const hasValidEmailConnection = async (userId: string): Promise<boolean> => {
  try {
    console.log("Checking email connection for user:", userId);

    if (!userId) {
      console.error("No user ID provided when checking email connection");
      return false;
    }

    const { data, error } = await supabase
      .from('email_connections')
      .select('status, email_address, provider')
      .eq('user_id', userId)
      .maybeSingle();
    
    // Log detailed information for debugging
    if (error) {
      console.error("Error checking email connection:", error);
      return false;
    }
    
    if (!data) {
      console.log("No email connection record found for user:", userId);
      return false;
    }

    console.log("Email connection record found:", {
      status: data.status,
      email: data.email_address,
      provider: data.provider
    });
    
    return data.status === 'connected';
  } catch (error) {
    console.error("Exception when checking email connection:", error);
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

// Create a new function to manually insert or update a connection for testing
export const createOrUpdateEmailConnection = async (
  userId: string,
  emailAddress: string,
  provider: string,
  status: string = 'connected'
): Promise<boolean> => {
  try {
    console.log(`Creating/updating email connection for user ${userId} with status: ${status}`);
    
    const { error } = await supabase
      .from('email_connections')
      .upsert({
        user_id: userId,
        email_address: emailAddress,
        provider: provider,
        status: status,
        updated_at: new Date().toISOString(),
        connected_at: status === 'connected' ? new Date().toISOString() : null
      }, {
        onConflict: 'user_id'
      });
    
    if (error) {
      console.error("Error creating/updating email connection:", error);
      return false;
    }
    
    console.log("Email connection created/updated successfully");
    return true;
  } catch (error) {
    console.error("Exception when creating/updating email connection:", error);
    return false;
  }
};
