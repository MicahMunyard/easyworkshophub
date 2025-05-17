import React, { useState, useCallback } from 'react';
import { EmailDesignerProps } from './types';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const EmailDesigner: React.FC<EmailDesignerProps> = (props) => {
  const { initialTemplate, onSave, mode, onCancel } = props;
  const [name, setName] = useState(initialTemplate?.name || '');
  const [subject, setSubject] = useState(initialTemplate?.subject || '');
  const [content, setContent] = useState(initialTemplate?.content || '');
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  }, []);

  const handleSubjectChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSubject(e.target.value);
  }, []);

  const handleContentChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const success = await onSave({ name, subject, content });
      if (success) {
        toast({
          title: `${mode === 'template' ? 'Template' : 'Campaign'} saved`,
          description: `The ${mode === 'template' ? 'template' : 'campaign'} has been saved successfully.`,
        });
      } else {
        toast({
          title: "Error",
          description: `Failed to save ${mode === 'template' ? 'template' : 'campaign'}.`,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `An error occurred while saving the ${mode === 'template' ? 'template' : 'campaign'}.`,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            type="text"
            id="name"
            placeholder="Template Name"
            value={name}
            onChange={handleNameChange}
          />
        </div>
        <div>
          <Label htmlFor="subject">Subject</Label>
          <Input
            type="text"
            id="subject"
            placeholder="Email Subject"
            value={subject}
            onChange={handleSubjectChange}
          />
        </div>
      </div>
      <div>
        <Label htmlFor="content">Content</Label>
        <Textarea
          id="content"
          placeholder="Email Content"
          value={content}
          onChange={handleContentChange}
          rows={8}
        />
      </div>
      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </div>
  );
};

export default EmailDesigner;
