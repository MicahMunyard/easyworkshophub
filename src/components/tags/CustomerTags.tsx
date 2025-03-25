
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlusCircle, X } from "lucide-react";
import { useCustomerTags } from "./useCustomerTags";
import AddTagDialog from "./AddTagDialog";
import CreateTagDialog from "./CreateTagDialog";
import { CustomerTagsProps } from "./types";

const CustomerTags: React.FC<CustomerTagsProps> = ({ customerId, onTagsUpdated }) => {
  const { 
    tags, 
    isAddingTag, 
    isCreatingTag, 
    setIsAddingTag, 
    setIsCreatingTag, 
    addTagToCustomer, 
    removeTagFromCustomer, 
    createNewTag, 
    getAvailableTags 
  } = useCustomerTags(customerId, onTagsUpdated);

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
      <AddTagDialog 
        isOpen={isAddingTag}
        onClose={() => setIsAddingTag(false)}
        availableTags={getAvailableTags()}
        onAddTag={addTagToCustomer}
        onCreateNewTag={() => {
          setIsAddingTag(false);
          setIsCreatingTag(true);
        }}
      />

      {/* Create New Tag Dialog */}
      <CreateTagDialog 
        isOpen={isCreatingTag}
        onClose={() => setIsCreatingTag(false)}
        onCreateTag={createNewTag}
      />
    </div>
  );
};

export default CustomerTags;
