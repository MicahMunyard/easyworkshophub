
import { supabase } from '@/integrations/supabase/client';

// Fetch email templates from Supabase
export const getEmailTemplates = async (userId: string, templateType?: string) => {
  let query = supabase
    .from('email_templates')
    .select('*')
    .eq('user_id', userId);
  
  if (templateType) {
    query = query.eq('template_type', templateType);
  }
  
  const { data, error } = await query.order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching email templates:', error);
    throw error;
  }
  
  return data || [];
};

// Save a new email template to Supabase
export const saveEmailTemplate = async (
  userId: string,
  name: string,
  subject: string,
  content: string,
  category: string,
  isDefault: boolean = false
) => {
  const { data, error } = await supabase
    .from('email_templates')
    .insert([{
      user_id: userId,
      name: name,
      subject: subject,
      body: content, // Note: database field is 'body' but our interface uses 'content'
      template_type: category, // Note: database field is 'template_type' but our interface uses 'category'
      is_default: isDefault,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }])
    .select('id')
    .single();
  
  if (error) {
    console.error('Error saving email template:', error);
    throw error;
  }
  
  return data?.id;
};
