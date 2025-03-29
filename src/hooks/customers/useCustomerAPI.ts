
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
          const totalSpending = await getCustomerTotalSpending(customer.phone);
          
          return {
            id: customer.id,
            name: customer.name,
            phone: customer.phone || "",
            email: customer.email,
            status: customer.status as "active" | "inactive",
            lastVisit: customer.last_visit,
            totalBookings: bookingCount,
            vehicleInfo: vehicleData?.map(v => v.vehicle_info) || [],
            totalSpending: totalSpending
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

  const getCustomerTotalSpending = async (phone: string): Promise<number> => {
    try {
      if (!phone) return 0;
      
      const { data: bookings, error } = await supabase
        .from('user_bookings')
        .select('cost')
        .eq('user_id', user?.id)
        .eq('customer_phone', phone)
        .not('cost', 'is', null);
      
      if (error) {
        console.error('Error counting total spending:', error);
        return 0;
      }
      
      return bookings.reduce((sum, booking) => sum + (booking.cost || 0), 0);
    } catch (error) {
      console.error('Error getting total spending:', error);
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
      if (!customerId || isNaN(parseInt(customerId, 10))) {
        console.log("Invalid customer ID for booking history:", customerId);
        return [];
      }
      
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

  // Function to find existing customer by email or phone
  const findCustomerByEmailOrPhone = async (email: string, phone: string): Promise<CustomerType | null> => {
    try {
      if (!user) return null;
      if (!email && !phone) return null;
      
      let query = supabase
        .from('user_customers')
        .select('*')
        .eq('user_id', user.id);
      
      if (email) {
        query = query.eq('email', email);
      } else if (phone) {
        query = query.eq('phone', phone);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error finding customer:', error);
        return null;
      }
      
      if (data && data.length > 0) {
        // Return the first matching customer
        const matchingCustomer = data[0];
        
        // Get vehicle info for the customer
        const { data: vehicleData } = await supabase
          .from('user_customer_vehicles')
          .select('vehicle_info')
          .eq('customer_id', matchingCustomer.id);
        
        return {
          id: matchingCustomer.id,
          name: matchingCustomer.name,
          phone: matchingCustomer.phone || "",
          email: matchingCustomer.email,
          status: matchingCustomer.status as "active" | "inactive",
          lastVisit: matchingCustomer.last_visit,
          totalBookings: await getCustomerBookingCount(matchingCustomer.id),
          vehicleInfo: vehicleData?.map(v => v.vehicle_info) || []
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error finding customer by email/phone:', error);
      return null;
    }
  };

  return {
    fetchCustomers,
    deleteAllCustomers,
    getBookingHistoryForCustomer,
    findCustomerByEmailOrPhone  // Export the new function
  };
};
