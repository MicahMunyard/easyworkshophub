import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { CustomerType } from "@/types/customer";
import { CustomerBookingHistory } from "./types";

export const useCustomerAPI = () => {
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchCustomers = async (): Promise<CustomerType[]> => {
    try {
      if (!user) return [];
      
      const { data: customerData, error } = await supabase
        .from('user_customers')
        .select('*')
        .eq('user_id', user?.id);
      
      if (error) {
        throw error;
      }
      
      const customersWithVehicles = await Promise.all(
        (customerData || []).map(async (customer) => {
          const { data: vehicleData } = await supabase
            .from('user_customer_vehicles')
            .select('vehicle_info')
            .eq('customer_id', customer.id);
          
          const bookingCount = await getCustomerBookingCount(customer.id);
          
          return {
            id: customer.id,
            name: customer.name,
            phone: customer.phone || "",
            email: customer.email,
            status: customer.status as "active" | "inactive",
            lastVisit: customer.last_visit,
            totalBookings: bookingCount,
            vehicleInfo: vehicleData?.map(v => v.vehicle_info) || []
          } as CustomerType;
        })
      );
      
      return customersWithVehicles;
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast({
        variant: "destructive",
        title: "Error fetching customers",
        description: "Could not load customer data"
      });
      return [];
    }
  };

  const getCustomerBookingCount = async (customerId: string): Promise<number> => {
    try {
      const { data: customerData, error: customerError } = await supabase
        .from('user_customers')
        .select('phone')
        .eq('id', customerId)
        .single();
      
      if (customerError || !customerData) {
        console.error('Error getting customer phone:', customerError);
        return 0;
      }
      
      const { count, error } = await supabase
        .from('user_bookings')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user?.id)
        .eq('customer_phone', customerData.phone);
      
      if (error) {
        console.error('Error counting bookings:', error);
        return 0;
      }
      
      return count || 0;
    } catch (error) {
      console.error('Error getting booking count:', error);
      return 0;
    }
  };

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

  const getBookingHistoryForCustomer = async (customerId: string) => {
    try {
      const { data: customerData, error: customerError } = await supabase
        .from('user_customers')
        .select('phone, name')
        .eq('id', customerId)
        .single();
      
      if (customerError || !customerData) {
        console.error('Error getting customer:', customerError);
        return [];
      }
      
      const { data: bookings, error: bookingsError } = await supabase
        .from('user_bookings')
        .select(`
          id, 
          customer_name, 
          service, 
          car, 
          booking_date, 
          status, 
          cost,
          technician_id
        `)
        .eq('user_id', user?.id)
        .eq('customer_phone', customerData.phone)
        .order('booking_date', { ascending: false });
      
      if (bookingsError) {
        console.error('Error fetching booking history:', bookingsError);
        return [];
      }
      
      const formattedBookings = await Promise.all((bookings || []).map(async (booking) => {
        let technicianName = "Unassigned";
        
        if (booking.technician_id) {
          const { data: techData } = await supabase
            .from('user_technicians')
            .select('name')
            .eq('id', booking.technician_id)
            .single();
            
          if (techData) {
            technicianName = techData.name;
          }
        }
        
        let bookingCost = booking.cost || 0;
        
        if (booking.service_id && (!bookingCost || bookingCost === 0)) {
          console.log("Would fetch service price using service_id if available");
        }
        
        return {
          id: typeof booking.id === 'string' ? parseInt(booking.id.replace(/-/g, '').substring(0, 8), 16) : booking.id,
          date: booking.booking_date,
          service: booking.service,
          vehicle: booking.car,
          cost: bookingCost,
          status: booking.status as "pending" | "confirmed" | "completed" | "cancelled",
          mechanic: technicianName
        };
      }));
      
      return formattedBookings;
    } catch (error) {
      console.error('Error getting booking history:', error);
      return [];
    }
  };

  return {
    fetchCustomers,
    deleteAllCustomers,
    getBookingHistoryForCustomer
  };
};
