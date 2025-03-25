
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, Plus } from "lucide-react";
import { useCustomerTags } from "./useCustomerTags";
import AddTagDialog from "./AddTagDialog";
import CreateTagDialog from "./CreateTagDialog";
import { CustomerTag } from "./types";

interface CustomerTagsProps {
  customerId: string;
  onTagsUpdated?: () => void;
}

const CustomerTags: React.FC<CustomerTagsProps> = ({ customerId, onTagsUpdated }) => {
  const {
    tags,
    isLoading,
    isAddingTag,
    setIsAddingTag,
    isCreatingTag,
    setIsCreatingTag,
    addTagToCustomer,
    removeTagFromCustomer,
    createNewTag,
    getAvailableTags,
    refreshTags
  } = useCustomerTags(customerId, onTagsUpdated);

  const handleRemoveTag = (tagId: string) => {
    removeTagFromCustomer(tagId);
  };

  const handleAddTag = (tagId: string) => {
    addTagToCustomer(tagId);
  };

  const handleCreateTag = (newTag: Omit<CustomerTag, "id">) => {
    createNewTag(newTag);
  };

  if (isLoading) {
    return <div className="flex gap-2 items-center py-2">Loading tags...</div>;
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2 items-center">
        {tags.length === 0 ? (
          <span className="text-sm text-muted-foreground">No tags</span>
        ) : (
          tags.map((tag) => (
            <Badge
              key={tag.id}
              style={{ backgroundColor: tag.color }}
              className="flex items-center gap-1 px-3 py-1"
            >
              {tag.name}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 ml-1 hover:bg-black/20"
                onClick={() => handleRemoveTag(tag.id)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))
        )}
        <Button
          variant="outline"
          size="sm"
          className="h-7 gap-1"
          onClick={() => setIsAddingTag(true)}
        >
          <Plus className="h-3.5 w-3.5" />
          Add Tag
        </Button>
      </div>

      <AddTagDialog
        isOpen={isAddingTag}
        onOpenChange={setIsAddingTag}
        availableTags={getAvailableTags()}
        onAddTag={handleAddTag}
        onCreateNewTag={() => {
          setIsAddingTag(false);
          setIsCreatingTag(true);
        }}
      />

      <CreateTagDialog
        isOpen={isCreatingTag}
        onOpenChange={setIsCreatingTag}
        onCreateTag={handleCreateTag}
      />
    </div>
  );
};

export default CustomerTags;
