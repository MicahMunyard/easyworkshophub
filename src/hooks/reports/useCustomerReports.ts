
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';

type MonthlyData = {
  name: string;
  value: number;
};

type CustomerReportData = {
  totalCustomers: number;
  newCustomers: number;
  customerRetention: number;
  averageLifetimeValue: number;
  customerData: MonthlyData[];
};

export const useCustomerReports = () => {
  const [data, setData] = useState<CustomerReportData>({
    totalCustomers: 0,
    newCustomers: 0,
    customerRetention: 0,
    averageLifetimeValue: 0,
    customerData: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchCustomerData = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      
      try {
        // Get current month's dates
        const currentMonth = new Date();
        const startDate = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
        const endDate = format(endOfMonth(currentMonth), 'yyyy-MM-dd');
        const prevMonthStart = format(startOfMonth(subMonths(currentMonth, 1)), 'yyyy-MM-dd');
        const prevMonthEnd = format(endOfMonth(subMonths(currentMonth, 1)), 'yyyy-MM-dd');
        
        // Fetch all active customers
        const { data: allCustomers, error: customersError } = await supabase
          .from('user_customers')
          .select('id, created_at')
          .eq('user_id', user.id)
          .eq('status', 'active');
          
        if (customersError) throw customersError;
        
        // Calculate total customers
        const totalCustomers = allCustomers?.length || 0;
        
        // Calculate new customers this month
        const newCustomers = allCustomers?.filter(customer => {
          const createdAt = new Date(customer.created_at);
          return createdAt >= new Date(startDate) && createdAt <= new Date(endDate);
        }).length || 0;
        
        // Calculate customer retention
        // First, get customers who had bookings last month
        const { data: lastMonthActiveCustomers, error: lastMonthError } = await supabase
          .from('user_bookings')
          .select('customer_name')
          .eq('user_id', user.id)
          .gte('booking_date', prevMonthStart)
          .lte('booking_date', prevMonthEnd);
          
        if (lastMonthError) throw lastMonthError;
        
        // Then, see how many of them have bookings this month
        let retainedCount = 0;
        
        if (lastMonthActiveCustomers && lastMonthActiveCustomers.length > 0) {
          // Create a set of unique customer names from last month
          const lastMonthCustomerNames = new Set(
            lastMonthActiveCustomers.map(booking => booking.customer_name)
          );
          
          // Get this month's bookings
          const { data: thisMonthBookings, error: thisMonthError } = await supabase
            .from('user_bookings')
            .select('customer_name')
            .eq('user_id', user.id)
            .gte('booking_date', startDate)
            .lte('booking_date', endDate);
            
          if (thisMonthError) throw thisMonthError;
          
          if (thisMonthBookings && thisMonthBookings.length > 0) {
            // Count how many customers from last month also have bookings this month
            const thisMonthCustomerNames = new Set(
              thisMonthBookings.map(booking => booking.customer_name)
            );
            
            lastMonthCustomerNames.forEach(name => {
              if (thisMonthCustomerNames.has(name)) {
                retainedCount++;
              }
            });
          }
        }
        
        const customerRetention = lastMonthActiveCustomers && lastMonthActiveCustomers.length > 0 ?
          Math.round((retainedCount / lastMonthActiveCustomers.length) * 100) : 0;
        
        // Calculate average lifetime value
        // Get all invoices
        const { data: invoices, error: invoicesError } = await supabase
          .from('user_invoices')
          .select('customer_name, total')
          .eq('user_id', user.id);
          
        if (invoicesError) throw invoicesError;
        
        // Group by customer to calculate lifetime value
        const customerTotals: Record<string, number> = {};
        
        invoices?.forEach(invoice => {
          if (invoice.customer_name) {
            customerTotals[invoice.customer_name] = (customerTotals[invoice.customer_name] || 0) + Number(invoice.total);
          }
        });
        
        const customerLifetimeValues = Object.values(customerTotals);
        const averageLifetimeValue = customerLifetimeValues.length > 0 ?
          customerLifetimeValues.reduce((sum, val) => sum + val, 0) / customerLifetimeValues.length : 0;
        
        // Get historical customer growth data for the past 6 months
        const customerData: MonthlyData[] = [];
        for (let i = 5; i >= 0; i--) {
          const month = subMonths(new Date(), i);
          const monthStart = format(startOfMonth(month), 'yyyy-MM-dd');
          const monthEnd = format(endOfMonth(month), 'yyyy-MM-dd');
          const monthName = format(month, 'MMM');
          
          const { data: newMonthCustomers, error: monthError } = await supabase
            .from('user_customers')
            .select('id')
            .eq('user_id', user.id)
            .gte('created_at', monthStart)
            .lte('created_at', monthEnd);
            
          if (monthError) throw monthError;
          
          customerData.push({ name: monthName, value: newMonthCustomers?.length || 0 });
        }
        
        setData({
          totalCustomers,
          newCustomers,
          customerRetention,
          averageLifetimeValue,
          customerData,
        });
      } catch (error) {
        console.error('Error fetching customer reports:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomerData();
  }, [user]);

  return {
    ...data,
    isLoading,
  };
};
