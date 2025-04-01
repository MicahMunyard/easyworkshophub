
import React from 'react';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { JobNote } from '@/types/technician';

interface JobNotesSectionProps {
  notes: JobNote[];
}

export const JobNotesSection: React.FC<JobNotesSectionProps> = ({ notes }) => {
  return (
    <>
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
      </CardContent>
    </>
  );
};

export default JobNotesSection;
