
import React from "react";
import { CustomerNote } from "./types";
import NoteItem from "./NoteItem";

interface NotesListProps {
  notes: CustomerNote[];
  onDeleteNote: (noteId: string) => void;
  isLoading: boolean;
}

const NotesList: React.FC<NotesListProps> = ({ 
  notes, 
  onDeleteNote,
  isLoading 
}) => {
  if (isLoading) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        Loading notes...
      </div>
    );
  }

  if (notes.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        No notes have been added for this customer
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {notes.map((note) => (
        <NoteItem 
          key={note.id}
          note={note}
          onDelete={onDeleteNote}
        />
      ))}
    </div>
  );
};

export default NotesList;
