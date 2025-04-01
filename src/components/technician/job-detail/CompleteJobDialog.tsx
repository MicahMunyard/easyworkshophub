
import React from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface CompleteJobDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  completeNotes: string;
  setCompleteNotes: (notes: string) => void;
  onComplete: () => void;
}

const CompleteJobDialog: React.FC<CompleteJobDialogProps> = ({
  open,
  onOpenChange,
  completeNotes,
  setCompleteNotes,
  onComplete
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Complete Job</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <Label htmlFor="complete-notes">Completion Notes</Label>
          <Textarea 
            id="complete-notes" 
            placeholder="Add any notes about the completed work..."
            className="mt-1"
            value={completeNotes}
            onChange={(e) => setCompleteNotes(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onComplete}>
            Complete Job
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CompleteJobDialog;
