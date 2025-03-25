
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface CreateTagDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTag: (name: string, color: string) => void;
}

const CreateTagDialog: React.FC<CreateTagDialogProps> = ({ 
  isOpen, 
  onClose, 
  onCreateTag 
}) => {
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState("#3B82F6"); // Default blue color

  const handleCreateTag = () => {
    onCreateTag(newTagName, newTagColor);
    setNewTagName("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
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
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleCreateTag}>
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTagDialog;
