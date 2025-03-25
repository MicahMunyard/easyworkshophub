
import React from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { CustomerTag } from "./types";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, Plus } from "lucide-react";

interface AddTagDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  availableTags: CustomerTag[];
  onAddTag: (tagId: string) => void;
  onCreateNewTag: () => void;
}

const AddTagDialog: React.FC<AddTagDialogProps> = ({
  isOpen,
  onOpenChange,
  availableTags,
  onAddTag,
  onCreateNewTag
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Tag</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-2">
              {availableTags.length > 0 ? (
                availableTags.map((tag) => (
                  <div
                    key={tag.id}
                    className="flex items-center justify-between rounded-md border p-2 hover:bg-muted/50 cursor-pointer"
                    onClick={() => {
                      onAddTag(tag.id);
                      onOpenChange(false);
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: tag.color }}
                      />
                      <span>{tag.name}</span>
                    </div>
                    <Check className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100" />
                  </div>
                ))
              ) : (
                <div className="text-center text-sm text-muted-foreground">
                  No tags available
                </div>
              )}
            </div>
          </ScrollArea>
          <Button
            variant="outline"
            size="sm"
            className="mt-4 w-full"
            onClick={() => {
              onCreateNewTag();
              onOpenChange(false);
            }}
          >
            <Plus className="mr-2 h-4 w-4" /> Create New Tag
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddTagDialog;
