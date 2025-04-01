
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface JobNote {
  id: string;
  content: string;
  created_at: string;
  author: string;
}

interface JobNotesTabProps {
  jobId: string;
  notes: JobNote[];
}

const JobNotesTab: React.FC<JobNotesTabProps> = ({ jobId, notes }) => {
  const [noteContent, setNoteContent] = useState("");

  const handleAddNote = () => {
    // Note: This would be implemented with real functionality
    console.log("Adding note:", noteContent);
    setNoteContent("");
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Job Notes</CardTitle>
      </CardHeader>
      <CardContent>
        {notes.length === 0 ? (
          <p className="text-muted-foreground text-center py-6">No notes for this job</p>
        ) : (
          <div className="space-y-4">
            {notes.map(note => (
              <div key={note.id} className="border rounded-md p-3">
                <div className="flex justify-between items-start">
                  <p className="text-sm font-medium">{note.author}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(note.created_at).toLocaleString()}
                  </p>
                </div>
                <p className="mt-1">{note.content}</p>
              </div>
            ))}
          </div>
        )}
        
        <div className="mt-4">
          <Label htmlFor="add-note">Add Note</Label>
          <Textarea 
            id="add-note" 
            placeholder="Type your note here..." 
            className="mt-1"
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
          />
          <Button className="mt-2" onClick={handleAddNote}>Add Note</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default JobNotesTab;
