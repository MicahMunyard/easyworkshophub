
import React from "react";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Clock, Trash2 } from "lucide-react";
import { CustomerNote } from "./types";

interface NoteItemProps {
  note: CustomerNote;
  onDelete: (noteId: string) => void;
}

const NoteItem: React.FC<NoteItemProps> = ({ note, onDelete }) => {
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM d, yyyy 'at' h:mm a");
  };

  return (
    <Card key={note.id} className="hover:shadow-sm transition-shadow">
      <CardContent className="p-4">
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-3.5 w-3.5" />
              <span>{note.created_by || 'Unknown'}</span>
              <span className="mx-1">•</span>
              <Clock className="h-3.5 w-3.5" />
              <span>{formatDate(note.created_at)}</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-red-500"
              onClick={() => onDelete(note.id)}
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Delete note</span>
            </Button>
          </div>
          <p className="text-sm whitespace-pre-wrap">{note.note}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default NoteItem;
