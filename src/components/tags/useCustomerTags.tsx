
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { CustomerTag } from "./types";

export const useCustomerTags = (customerId: string, onTagsUpdated?: () => void) => {
  const [tags, setTags] = useState<CustomerTag[]>([]);
  const [allTags, setAllTags] = useState<CustomerTag[]>([]);
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [isCreatingTag, setIsCreatingTag] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchCustomerTags();
    fetchAllTags();
  }, [customerId]);

  const fetchCustomerTags = async () => {
    try {
      const { data, error } = await supabase
        .from('customer_tag_relations')
        .select(`
          tag_id,
          customer_tags (
            id,
            name,
            color
          )
        `)
        .eq('customer_id', customerId);

      if (error) throw error;

      const formattedTags = data.map(item => ({
        id: item.customer_tags.id,
        name: item.customer_tags.name,
        color: item.customer_tags.color
      }));

      setTags(formattedTags);
    } catch (error: any) {
      console.error("Error fetching customer tags:", error.message);
      toast({
        variant: "destructive",
        title: "Error fetching tags",
        description: error.message,
      });
    }
  };

  const fetchAllTags = async () => {
    try {
      const { data, error } = await supabase
        .from('customer_tags')
        .select('*');

      if (error) throw error;
      setAllTags(data);
    } catch (error: any) {
      console.error("Error fetching all tags:", error.message);
    }
  };

  const addTagToCustomer = async (tagId: string) => {
    try {
      const { error } = await supabase
        .from('customer_tag_relations')
        .insert({
          customer_id: customerId,
          tag_id: tagId
        });

      if (error) throw error;

      fetchCustomerTags();
      if (onTagsUpdated) onTagsUpdated();
      setIsAddingTag(false);
      
      toast({
        title: "Tag added",
        description: "Tag has been added to the customer successfully",
      });
    } catch (error: any) {
      console.error("Error adding tag to customer:", error.message);
      toast({
        variant: "destructive",
        title: "Error adding tag",
        description: error.message,
      });
    }
  };

  const removeTagFromCustomer = async (tagId: string) => {
    try {
      const { error } = await supabase
        .from('customer_tag_relations')
        .delete()
        .eq('customer_id', customerId)
        .eq('tag_id', tagId);

      if (error) throw error;

      fetchCustomerTags();
      if (onTagsUpdated) onTagsUpdated();
      
      toast({
        title: "Tag removed",
        description: "Tag has been removed from the customer successfully",
      });
    } catch (error: any) {
      console.error("Error removing tag from customer:", error.message);
      toast({
        variant: "destructive",
        title: "Error removing tag",
        description: error.message,
      });
    }
  };

  const createNewTag = async (tagName: string, tagColor: string) => {
    if (!tagName.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Tag name cannot be empty",
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('customer_tags')
        .insert({
          name: tagName.trim(),
          color: tagColor
        })
        .select();

      if (error) throw error;

      toast({
        title: "Tag created",
        description: "New tag has been created successfully",
      });

      setIsCreatingTag(false);
      fetchAllTags();
      
      // Automatically add the new tag to this customer
      if (data && data.length > 0) {
        addTagToCustomer(data[0].id);
      }
    } catch (error: any) {
      console.error("Error creating new tag:", error.message);
      toast({
        variant: "destructive",
        title: "Error creating tag",
        description: error.message,
      });
    }
  };

  const getAvailableTags = () => {
    return allTags.filter(tag => !tags.some(t => t.id === tag.id));
  };

  return {
    tags,
    isAddingTag,
    isCreatingTag,
    setIsAddingTag,
    setIsCreatingTag,
    addTagToCustomer,
    removeTagFromCustomer,
    createNewTag,
    getAvailableTags
  };
};
