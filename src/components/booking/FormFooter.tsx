
import React from "react";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Trash2 } from "lucide-react";

interface FormFooterProps {
  isEditing: boolean;
  onDeleteClick?: () => void;
  onClose: () => void;
  type?: "default" | "scheduling";
}

const FormFooter: React.FC<FormFooterProps> = ({
  isEditing,
  onDeleteClick,
  onClose,
  type = "default"
}) => {
  if (type === "default") {
    return null;
  }

  return (
    <DialogFooter className="flex justify-between">
      {isEditing && onDeleteClick && (
        <div>
          <Button 
            type="button" 
            variant="destructive" 
            onClick={onDeleteClick}
            className="gap-1"
          >
            <Trash2 className="h-4 w-4" /> Delete
          </Button>
        </div>
      )}
      <div className="flex gap-2">
        <Button variant="outline" type="button" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">
          {isEditing ? "Save Changes" : "Save Booking"}
        </Button>
      </div>
    </DialogFooter>
  );
};

export default FormFooter;
