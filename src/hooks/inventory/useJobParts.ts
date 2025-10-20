import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { JobPartRequest, JobPartRequestWithInventory } from '@/types/jobParts';

export const useJobParts = (jobId?: string) => {
  const [parts, setParts] = useState<JobPartRequestWithInventory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchJobParts = async () => {
    if (!jobId) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('job_parts_requests')
        .select(`
          *,
          inventory_item:user_inventory_items(id, name, code, in_stock, price, supplier),
          job:jobs!job_id(customer, vehicle, service)
        `)
        .eq('job_id', jobId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setParts(data as any || []);
    } catch (error) {
      console.error('Error fetching job parts:', error);
      toast({
        title: "Error loading parts",
        description: "Failed to load parts requests for this job.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllPendingParts = async (userId: string) => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('job_parts_requests')
        .select(`
          *,
          inventory_item:user_inventory_items(id, name, code, in_stock, price, supplier),
          job:jobs!job_id(customer, vehicle, service)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setParts(data as any || []);
    } catch (error) {
      console.error('Error fetching pending parts:', error);
      toast({
        title: "Error loading parts",
        description: "Failed to load pending parts requests.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const requestPart = async (
    jobId: string,
    technicianId: string,
    partName: string,
    quantity: number,
    inventoryItemId?: string
  ) => {
    try {
      // If linking to inventory item, get price info
      let unitCost = null;
      let totalCost = null;
      let partCode = null;

      if (inventoryItemId) {
        const { data: inventoryItem, error: invError } = await supabase
          .from('user_inventory_items')
          .select('price, code')
          .eq('id', inventoryItemId)
          .single();

        if (!invError && inventoryItem) {
          unitCost = inventoryItem.price;
          totalCost = Number(inventoryItem.price) * quantity;
          partCode = inventoryItem.code;
        }
      }

      const { data, error } = await supabase
        .from('job_parts_requests')
        .insert({
          job_id: jobId,
          inventory_item_id: inventoryItemId || null,
          part_name: partName,
          part_code: partCode,
          quantity,
          unit_cost: unitCost,
          total_cost: totalCost,
          requested_by: technicianId,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Parts requested",
        description: `Request for ${partName} has been submitted.`,
      });

      await fetchJobParts();
      return data;
    } catch (error) {
      console.error('Error requesting part:', error);
      toast({
        title: "Failed to request part",
        description: "Please try again.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const approvePart = async (partRequestId: string, userId: string, inventoryItemId?: string) => {
    try {
      const updateData: any = {
        status: 'approved',
        approved_by: userId,
        approved_at: new Date().toISOString()
      };

      // If linking to inventory item and wasn't linked before
      if (inventoryItemId) {
        const { data: inventoryItem } = await supabase
          .from('user_inventory_items')
          .select('price, code, in_stock')
          .eq('id', inventoryItemId)
          .single();

        if (inventoryItem) {
          // Get the part request to check quantity
          const { data: partRequest } = await supabase
            .from('job_parts_requests')
            .select('quantity')
            .eq('id', partRequestId)
            .single();

          if (partRequest) {
            updateData.inventory_item_id = inventoryItemId;
            updateData.unit_cost = inventoryItem.price;
            updateData.total_cost = Number(inventoryItem.price) * partRequest.quantity;
            updateData.part_code = inventoryItem.code;

            // Deduct from inventory stock
            const newStock = inventoryItem.in_stock - partRequest.quantity;
            await supabase
              .from('user_inventory_items')
              .update({ in_stock: newStock })
              .eq('id', inventoryItemId);
          }
        }
      }

      const { error } = await supabase
        .from('job_parts_requests')
        .update(updateData)
        .eq('id', partRequestId);

      if (error) throw error;

      toast({
        title: "Part approved",
        description: "The parts request has been approved.",
      });

      await fetchJobParts();
    } catch (error) {
      console.error('Error approving part:', error);
      toast({
        title: "Failed to approve part",
        description: "Please try again.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const denyPart = async (partRequestId: string, userId: string, reason: string) => {
    try {
      const { error } = await supabase
        .from('job_parts_requests')
        .update({
          status: 'denied',
          approved_by: userId,
          approved_at: new Date().toISOString(),
          denied_reason: reason
        })
        .eq('id', partRequestId);

      if (error) throw error;

      toast({
        title: "Part request denied",
        description: "The parts request has been denied.",
      });

      await fetchJobParts();
    } catch (error) {
      console.error('Error denying part:', error);
      toast({
        title: "Failed to deny part",
        description: "Please try again.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const markFulfilled = async (partRequestId: string) => {
    try {
      const { error } = await supabase
        .from('job_parts_requests')
        .update({ status: 'fulfilled' })
        .eq('id', partRequestId);

      if (error) throw error;

      toast({
        title: "Part marked as fulfilled",
        description: "The part has been marked as delivered.",
      });

      await fetchJobParts();
    } catch (error) {
      console.error('Error marking part fulfilled:', error);
      toast({
        title: "Failed to update part",
        description: "Please try again.",
        variant: "destructive"
      });
      throw error;
    }
  };

  useEffect(() => {
    if (jobId) {
      fetchJobParts();
    }
  }, [jobId]);

  return {
    parts,
    isLoading,
    requestPart,
    approvePart,
    denyPart,
    markFulfilled,
    fetchJobParts,
    fetchAllPendingParts
  };
};
