
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface OrderSubmissionData {
  parts: Array<{
    qty: number;
    sku: string;
    nettPriceEach: number;
    retailPriceEa?: number;
  }>;
  customerName?: string;
  customerAddress?: string;
  customerSuburb?: string;
  purchaseOrder?: string;
  orderNotes?: string;
  deliveryType?: '1' | '2'; // 1 = Delivery, 2 = Pick-Up
  forceOrder?: boolean;
  locationId?: string;
  locationName?: string;
  vehicleData?: {
    encryptedVehicleId?: number;
    rego?: string;
    make?: string;
    model?: string;
  };
  // EzyParts authentication credentials from the quote
  ezypartsCredentials?: {
    customerAccount: string;
    customerId: string;
    password: string;
  };
}

interface OrderSubmissionResponse {
  success: boolean;
  salesOrderNumber?: string;
  successItems?: Array<{ qty: number; sku: string }>;
  failedItems?: Array<{ 
    qty: number; 
    sku: string; 
    nettPriceEach: number; 
    retailPriceEa: number; 
    reason: string; 
  }>;
  message?: string;
  error?: string;
}

export const useEzyPartsOrder = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitOrder = async (orderData: OrderSubmissionData): Promise<OrderSubmissionResponse> => {
    if (!user) {
      throw new Error('User must be authenticated');
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.functions.invoke('ezyparts-order', {
        body: {
          user_id: user.id,
          order_data: orderData
        }
      });

      if (error) {
        console.error('Order submission error:', error);
        throw new Error(error.message || 'Failed to submit order');
      }

      if (data.success) {
        toast({
          title: "Order Submitted Successfully",
          description: `Order ${data.salesOrderNumber} has been submitted to EzyParts.`,
        });

        // Show details about success/failed items
        if (data.failedItems && data.failedItems.length > 0) {
          toast({
            title: "Some Items Failed",
            description: `${data.failedItems.length} items could not be processed. Check the order details.`,
            variant: "destructive"
          });
        }
      } else {
        throw new Error(data.error || 'Order submission failed');
      }

      return data;
    } catch (error) {
      console.error('Error submitting EzyParts order:', error);
      toast({
        title: "Order Submission Failed",
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    submitOrder,
    isSubmitting
  };
};
