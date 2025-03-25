
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { CustomerTag } from "./types";

interface CreateTagDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateTag: (newTag: Omit<CustomerTag, "id">) => void;
}

const TAG_COLORS = [
  "#EF4444", // Red
  "#F97316", // Orange
  "#F59E0B", // Amber
  "#10B981", // Emerald
  "#06B6D4", // Cyan
  "#3B82F6", // Blue
  "#8B5CF6", // Violet
  "#EC4899", // Pink
];

const CreateTagDialog: React.FC<CreateTagDialogProps> = ({
  isOpen,
  onOpenChange,
  onCreateTag,
}) => {
  const [tagName, setTagName] = useState("");
  const [selectedColor, setSelectedColor] = useState(TAG_COLORS[0]);

  const handleCreateTag = () => {
    if (tagName.trim()) {
      onCreateTag({
        name: tagName.trim(),
        color: selectedColor,
      });
      setTagName("");
      setSelectedColor(TAG_COLORS[0]);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Tag</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="tag-name">Tag Name</Label>
            <Input
              id="tag-name"
              value={tagName}
              onChange={(e) => setTagName(e.target.value)}
              placeholder="Enter tag name"
            />
          </div>
          <div className="grid gap-2">
            <Label>Color</Label>
            <div className="flex gap-2 flex-wrap">
              {TAG_COLORS.map((color) => (
                <div
                  key={color}
                  className={`w-8 h-8 rounded-full cursor-pointer transition-all ${
                    selectedColor === color
                      ? "ring-2 ring-offset-2 ring-primary"
                      : ""
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setSelectedColor(color)}
                />
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreateTag}>Create Tag</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTagDialog;
