
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { CustomerNote } from "./types";

export const useCustomerNotes = (customerId: string) => {
  const [notes, setNotes] = useState<CustomerNote[]>([]);
  const [newNote, setNewNote] = useState("");
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user, profile } = useAuth();
  const { toast } = useToast();

  const fetchNotes = async () => {
    try {
      setIsLoading(true);
      
      // Make sure we have a valid numeric ID before querying
      if (!customerId || isNaN(parseInt(customerId, 10))) {
        console.log("Invalid customer ID for notes fetch:", customerId);
        setNotes([]);
        return;
      }
      
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
    } finally {
      setIsLoading(false);
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
      // Validate customer ID before inserting
      if (!customerId || isNaN(parseInt(customerId, 10))) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Invalid customer ID",
        });
        return;
      }
      
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

  useEffect(() => {
    if (customerId) {
      fetchNotes();
    }
  }, [customerId]);

  return {
    notes,
    newNote,
    isAddingNote,
    isLoading,
    setNewNote,
    setIsAddingNote,
    addNote,
    deleteNote
  };
};
