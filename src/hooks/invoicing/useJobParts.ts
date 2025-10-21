import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ApprovedPart {
  id: string;
  part_name: string;
  part_code: string | null;
  quantity: number;
  unit_cost: number | null;
  total_cost: number | null;
  inventory_item?: {
    price: number;
  };
}

export const useJobParts = (bookingId: string | null) => {
  const [parts, setParts] = useState<ApprovedPart[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchApprovedParts = async () => {
      if (!bookingId) {
        setParts([]);
        return;
      }

      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('job_parts_requests')
          .select(`
            id,
            part_name,
            part_code,
            quantity,
            unit_cost,
            total_cost,
            inventory_item:user_inventory_items(price)
          `)
          .eq('booking_id', bookingId)
          .eq('status', 'approved');

        if (error) throw error;
        setParts(data || []);
      } catch (error) {
        console.error('Error fetching approved parts:', error);
        setParts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchApprovedParts();
  }, [bookingId]);

  return { parts, isLoading };
};
