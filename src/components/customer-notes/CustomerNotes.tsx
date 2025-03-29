
import React from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useCustomerNotes } from "./useCustomerNotes";
import AddNoteForm from "./AddNoteForm";
import NotesList from "./NotesList";
import { CustomerNotesProps } from "./types";

const CustomerNotes: React.FC<CustomerNotesProps> = ({ customerId }) => {
  const {
    notes,
    newNote,
    isAddingNote,
    isLoading,
    setNewNote,
    setIsAddingNote,
    addNote,
    deleteNote
  } = useCustomerNotes(customerId);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-base font-medium">Customer Notes</h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setIsAddingNote(true)}
          className="flex items-center gap-1"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Add Note</span>
        </Button>
      </div>

      {isAddingNote && (
        <AddNoteForm
          newNote={newNote}
          onNoteChange={setNewNote}
          onCancel={() => {
            setIsAddingNote(false);
            setNewNote("");
          }}
          onSave={addNote}
        />
      )}

      <NotesList 
        notes={notes}
        onDeleteNote={deleteNote}
        isLoading={isLoading}
      />
    </div>
  );
};

export default CustomerNotes;
