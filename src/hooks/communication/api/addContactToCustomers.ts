
import { supabase } from "@/integrations/supabase/client";
import { Conversation } from "@/types/communication";
import { toast } from "@/hooks/use-toast";

export const addContactToCustomers = async (
  userId: string,
  conversation: Conversation
): Promise<boolean> => {
  try {
    // Check if customer already exists with this name and/or handle
    const { data: existingCustomers, error: lookupError } = await supabase
      .from('user_customers')
      .select('*')
      .eq('user_id', userId)
      .or(`name.eq.${conversation.contact_name},phone.eq.${conversation.contact_handle}`);
      
    if (lookupError) {
      throw lookupError;
    }
    
    // If customer doesn't exist, create a new one
    if (!existingCustomers || existingCustomers.length === 0) {
      const { error: createError } = await supabase
        .from('user_customers')
        .insert({
          user_id: userId,
          name: conversation.contact_name,
          phone: conversation.contact_handle,
          status: 'active',
          created_at: new Date().toISOString()
        });
        
      if (createError) {
        throw createError;
      }
      
      toast({
        title: "Customer Added",
        description: `${conversation.contact_name} has been added to your customers.`
      });
      
      return true;
    } else {
      toast({
        title: "Customer Already Exists",
        description: `${conversation.contact_name} is already in your customer database.`
      });
      
      return false;
    }
  } catch (error) {
    console.error('Error adding contact to customers:', error);
    toast({
      variant: "destructive",
      title: "Failed to add customer",
      description: "There was a problem adding this contact to your customers."
    });
    
    return false;
  }
};
