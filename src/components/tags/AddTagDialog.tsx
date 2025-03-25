
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { CustomerTag } from "./types";

interface AddTagDialogProps {
  isOpen: boolean;
  onClose: () => void;
  availableTags: CustomerTag[];
  onAddTag: (tagId: string) => void;
  onCreateNewTag: () => void;
}

const AddTagDialog: React.FC<AddTagDialogProps> = ({ 
  isOpen, 
  onClose, 
  availableTags, 
  onAddTag,
  onCreateNewTag 
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Tag to Customer</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {availableTags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {availableTags.map((tag) => (
                <Badge 
                  key={tag.id} 
                  style={{ backgroundColor: tag.color || undefined }}
                  className="px-2 py-1 flex items-center gap-1 cursor-pointer hover:opacity-80"
                  onClick={() => onAddTag(tag.id)}
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
            onClick={onCreateNewTag}
          >
            Create New Tag
          </Button>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddTagDialog;
