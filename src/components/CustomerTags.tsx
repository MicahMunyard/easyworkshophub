
import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlusCircle, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

interface CustomerTag {
  id: string;
  name: string;
  color?: string;
}

interface CustomerTagsProps {
  customerId: number;
  onTagsUpdated?: () => void;
}

const CustomerTags: React.FC<CustomerTagsProps> = ({ customerId, onTagsUpdated }) => {
  const [tags, setTags] = useState<CustomerTag[]>([]);
  const [allTags, setAllTags] = useState<CustomerTag[]>([]);
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [isCreatingTag, setIsCreatingTag] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState("#3B82F6"); // Default blue color
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

  const createNewTag = async () => {
    if (!newTagName.trim()) {
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
          name: newTagName.trim(),
          color: newTagColor
        })
        .select();

      if (error) throw error;

      toast({
        title: "Tag created",
        description: "New tag has been created successfully",
      });

      setNewTagName("");
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

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium">Tags</h3>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setIsAddingTag(true)}
          className="h-8 w-8 p-0"
        >
          <PlusCircle className="h-4 w-4" />
          <span className="sr-only">Add Tag</span>
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {tags.length > 0 ? (
          tags.map((tag) => (
            <Badge 
              key={tag.id} 
              style={{ backgroundColor: tag.color || undefined }}
              className="px-2 py-1 flex items-center gap-1 cursor-default"
            >
              {tag.name}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeTagFromCustomer(tag.id)}
                className="h-4 w-4 p-0 ml-1 text-white hover:text-red-300 hover:bg-transparent"
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remove Tag</span>
              </Button>
            </Badge>
          ))
        ) : (
          <div className="text-xs text-muted-foreground">No tags added</div>
        )}
      </div>

      {/* Add Tag Dialog */}
      <Dialog open={isAddingTag} onOpenChange={setIsAddingTag}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Tag to Customer</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {getAvailableTags().length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {getAvailableTags().map((tag) => (
                  <Badge 
                    key={tag.id} 
                    style={{ backgroundColor: tag.color || undefined }}
                    className="px-2 py-1 flex items-center gap-1 cursor-pointer hover:opacity-80"
                    onClick={() => addTagToCustomer(tag.id)}
                  >
                    {tag.name}
                  </Badge>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-2">
                No more tags available
              </div>
            )}
            
            <Button 
              variant="outline" 
              onClick={() => {
                setIsAddingTag(false);
                setIsCreatingTag(true);
              }}
            >
              Create New Tag
            </Button>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddingTag(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create New Tag Dialog */}
      <Dialog open={isCreatingTag} onOpenChange={setIsCreatingTag}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Tag</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="tag-name" className="text-right">
                Name
              </Label>
              <Input
                id="tag-name"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="tag-color" className="text-right">
                Color
              </Label>
              <div className="col-span-3 flex items-center gap-2">
                <Input
                  id="tag-color"
                  type="color"
                  value={newTagColor}
                  onChange={(e) => setNewTagColor(e.target.value)}
                  className="w-16 h-10 p-1"
                />
                <div 
                  className="w-8 h-8 rounded-full border"
                  style={{ backgroundColor: newTagColor }}
                ></div>
                <span className="text-sm">{newTagColor}</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreatingTag(false)}>
              Cancel
            </Button>
            <Button onClick={createNewTag}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustomerTags;
