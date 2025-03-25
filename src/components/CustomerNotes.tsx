
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { PlusCircle, Save, Trash2, User, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";

interface CustomerNote {
  id: string;
  note: string;
  created_at: string;
  created_by?: string;
  updated_at?: string;
}

interface CustomerNotesProps {
  customerId: string;
}

const CustomerNotes: React.FC<CustomerNotesProps> = ({ customerId }) => {
  const [notes, setNotes] = useState<CustomerNote[]>([]);
  const [newNote, setNewNote] = useState("");
  const [isAddingNote, setIsAddingNote] = useState(false);
  const { user, profile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchNotes();
  }, [customerId]);

  const fetchNotes = async () => {
    try {
      // Use parseInt to convert the string ID to a number for the database
      const numericCustomerId = parseInt(customerId, 10);
      
      const { data, error } = await supabase
        .from('customer_notes')
        .select('*')
        .eq('customer_id', numericCustomerId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotes(data || []);
    } catch (error: any) {
      console.error("Error fetching customer notes:", error.message);
      toast({
        variant: "destructive",
        title: "Error fetching notes",
        description: error.message,
      });
    }
  };

  const addNote = async () => {
    if (!newNote.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Note cannot be empty",
      });
      return;
    }

    try {
      // Use parseInt to convert the string ID to a number for the database
      const numericCustomerId = parseInt(customerId, 10);
      
      const { error } = await supabase
        .from('customer_notes')
        .insert({
          customer_id: numericCustomerId,
          note: newNote.trim(),
          created_by: profile?.full_name || user?.email || 'Unknown'
        });

      if (error) throw error;

      setNewNote("");
      setIsAddingNote(false);
      fetchNotes();
      
      toast({
        title: "Note added",
        description: "Customer note has been added successfully",
      });
    } catch (error: any) {
      console.error("Error adding customer note:", error.message);
      toast({
        variant: "destructive",
        title: "Error adding note",
        description: error.message,
      });
    }
  };

  const deleteNote = async (noteId: string) => {
    try {
      const { error } = await supabase
        .from('customer_notes')
        .delete()
        .eq('id', noteId);

      if (error) throw error;

      fetchNotes();
      
      toast({
        title: "Note deleted",
        description: "Customer note has been deleted successfully",
      });
    } catch (error: any) {
      console.error("Error deleting customer note:", error.message);
      toast({
        variant: "destructive",
        title: "Error deleting note",
        description: error.message,
      });
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM d, yyyy 'at' h:mm a");
  };

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
        <Card className="border-dashed">
          <CardContent className="p-4 space-y-4">
            <Textarea
              placeholder="Enter your note here..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              className="min-h-[100px]"
            />
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  setIsAddingNote(false);
                  setNewNote("");
                }}
              >
                Cancel
              </Button>
              <Button 
                size="sm" 
                onClick={addNote}
                className="flex items-center gap-1"
              >
                <Save className="h-4 w-4" />
                <span>Save</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {notes.length > 0 ? (
        <div className="space-y-3">
          {notes.map((note) => (
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
                      onClick={() => deleteNote(note.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete note</span>
                    </Button>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{note.note}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-6 text-muted-foreground">
          No notes have been added for this customer
        </div>
      )}
    </div>
  );
};

export default CustomerNotes;
