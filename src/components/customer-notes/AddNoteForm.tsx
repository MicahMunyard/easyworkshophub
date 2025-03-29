
import React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Save } from "lucide-react";

interface AddNoteFormProps {
  newNote: string;
  onNoteChange: (value: string) => void;
  onCancel: () => void;
  onSave: () => void;
}

const AddNoteForm: React.FC<AddNoteFormProps> = ({
  newNote,
  onNoteChange,
  onCancel,
  onSave
}) => {
  return (
    <Card className="border-dashed">
      <CardContent className="p-4 space-y-4">
        <Textarea
          placeholder="Enter your note here..."
          value={newNote}
          onChange={(e) => onNoteChange(e.target.value)}
          className="min-h-[100px]"
        />
        <div className="flex justify-end gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button 
            size="sm" 
            onClick={onSave}
            className="flex items-center gap-1"
          >
            <Save className="h-4 w-4" />
            <span>Save</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AddNoteForm;
