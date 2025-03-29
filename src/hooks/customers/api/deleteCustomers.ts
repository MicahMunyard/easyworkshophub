
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useFetchCustomers } from "./fetchCustomers";

export const useDeleteCustomers = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { fetchCustomers } = useFetchCustomers();

  const deleteAllCustomers = async (): Promise<boolean> => {
    try {
      if (!user) return false;
      
      for (const customer of await fetchCustomers()) {
        await supabase
          .from('user_customer_vehicles')
          .delete()
          .eq('customer_id', customer.id);
      }
      
      const { error } = await supabase
        .from('user_customers')
        .delete()
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "All customers have been deleted"
      });
      
      return true;
    } catch (error) {
      console.error('Error deleting customers:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete customers"
      });
      return false;
    }
  };

  return { deleteAllCustomers };
};
