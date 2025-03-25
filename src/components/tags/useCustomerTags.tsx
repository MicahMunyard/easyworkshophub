
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { CustomerTag } from "./types";

export const useCustomerTags = (customerId: string, onTagsUpdated?: () => void) => {
  const [tags, setTags] = useState<CustomerTag[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [allTags, setAllTags] = useState<CustomerTag[]>([]);
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [isCreatingTag, setIsCreatingTag] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchTags();
  }, [customerId]);

  const fetchTags = async () => {
    setIsLoading(true);
    try {
      // Fetch all customer tags first
      const { data: allTagsData, error: allTagsError } = await supabase
        .from('customer_tags')
        .select('*')
        .order('name');

      if (allTagsError) throw allTagsError;
      
      setAllTags(allTagsData || []);

      // Convert string customerId to number for database query
      const numericCustomerId = parseInt(customerId, 10);
      
      // Fetch the customer-specific tag relations
      const { data: relationData, error: relationError } = await supabase
        .from('customer_tag_relations')
        .select(`
          tag_id,
          customer_tags (
            id,
            name,
            color,
            description
          )
        `)
        .eq('customer_id', numericCustomerId);

      if (relationError) throw relationError;

      // Transform the data to get just the tags
      const customerTags = relationData?.map(item => ({
        id: item.customer_tags.id,
        name: item.customer_tags.name,
        color: item.customer_tags.color,
        description: item.customer_tags.description,
      })) || [];

      setTags(customerTags);
      
      if (onTagsUpdated) {
        onTagsUpdated();
      }
    } catch (error: any) {
      console.error("Error fetching customer tags:", error.message);
      toast({
        variant: "destructive",
        title: "Error fetching tags",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addTagToCustomer = async (tagId: string) => {
    try {
      // Convert string customerId to number for database
      const numericCustomerId = parseInt(customerId, 10);
      
      const { error } = await supabase
        .from('customer_tag_relations')
        .insert({
          customer_id: numericCustomerId,
          tag_id: tagId
        });

      if (error) throw error;

      fetchTags();
      
      toast({
        title: "Tag added",
        description: "Customer tag has been added successfully",
      });
    } catch (error: any) {
      console.error("Error adding customer tag:", error.message);
      toast({
        variant: "destructive",
        title: "Error adding tag",
        description: error.message,
      });
    } finally {
      setIsAddingTag(false);
    }
  };

  const removeTagFromCustomer = async (tagId: string) => {
    try {
      // Convert string customerId to number for database query
      const numericCustomerId = parseInt(customerId, 10);
      
      const { error } = await supabase
        .from('customer_tag_relations')
        .delete()
        .eq('customer_id', numericCustomerId)
        .eq('tag_id', tagId);

      if (error) throw error;

      fetchTags();
      
      toast({
        title: "Tag removed",
        description: "Customer tag has been removed successfully",
      });
    } catch (error: any) {
      console.error("Error removing customer tag:", error.message);
      toast({
        variant: "destructive",
        title: "Error removing tag",
        description: error.message,
      });
    }
  };

  const createNewTag = async (newTag: Omit<CustomerTag, "id">) => {
    try {
      const { data, error } = await supabase
        .from('customer_tags')
        .insert(newTag)
        .select();

      if (error) throw error;

      if (data && data.length > 0) {
        await addTagToCustomer(data[0].id);
        fetchTags();
      }
      
      toast({
        title: "Tag created",
        description: "New customer tag has been created and added to customer",
      });
    } catch (error: any) {
      console.error("Error creating customer tag:", error.message);
      toast({
        variant: "destructive",
        title: "Error creating tag",
        description: error.message,
      });
    } finally {
      setIsCreatingTag(false);
    }
  };
  
  const getAvailableTags = () => {
    const tagIds = new Set(tags.map(tag => tag.id));
    return allTags.filter(tag => !tagIds.has(tag.id));
  };

  return {
    tags,
    allTags,
    isLoading,
    isAddingTag,
    setIsAddingTag,
    isCreatingTag,
    setIsCreatingTag,
    addTagToCustomer,
    removeTagFromCustomer,
    createNewTag,
    getAvailableTags,
    refreshTags: fetchTags
  };
};
