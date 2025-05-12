
import React, { useRef, useState, useEffect } from 'react';
import EmailEditor from 'react-email-editor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface EmailDesignerProps {
  initialTemplate?: {
    name: string;
    subject: string;
    content: string;
  };
  onSave: (template: { name: string; subject: string; content: string }) => Promise<boolean>;
  mode: 'template' | 'campaign';
  onCancel?: () => void;
}

export const EmailDesigner: React.FC<EmailDesignerProps> = ({ 
  initialTemplate,
  onSave,
  mode,
  onCancel
}) => {
  const emailEditorRef = useRef<any>(null);
  const [name, setName] = useState(initialTemplate?.name || '');
  const [subject, setSubject] = useState(initialTemplate?.subject || '');
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('design');
  const { toast } = useToast();
  
  // Load template into editor when available
  useEffect(() => {
    if (initialTemplate?.content && emailEditorRef.current?.editor) {
      try {
        // Try loading as JSON design
        const design = JSON.parse(initialTemplate.content);
        emailEditorRef.current.editor.loadDesign(design);
      } catch (e) {
        // Fallback to loading as HTML
        emailEditorRef.current.editor.loadHTML(initialTemplate.content);
      }
    }
  }, [initialTemplate, emailEditorRef.current?.editor]);
  
  const saveTemplate = async () => {
    if (!name || !subject) {
      toast({
        title: 'Missing information',
        description: 'Please provide a name and subject',
        variant: 'destructive'
      });
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Export the design
      emailEditorRef.current.editor.exportHtml(async (data: any) => {
        const { html, design } = data;
        
        // Save both HTML and design JSON
        const success = await onSave({
          name, 
          subject,
          // Store both HTML and design state to allow editing later
          content: JSON.stringify({
            html,
            design
          })
        });
        
        if (success) {
          toast({
            title: mode === 'template' ? 'Template saved' : 'Campaign created',
            description: mode === 'template' ? 'Email template saved successfully' : 'Email campaign ready to send',
          });
        }
      });
    } catch (error) {
      toast({
        title: 'Save failed',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="name">Name</label>
          <Input 
            id="name" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            placeholder={mode === 'template' ? "Template name" : "Campaign name"}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="subject">Subject Line</label>
          <Input 
            id="subject" 
            value={subject} 
            onChange={(e) => setSubject(e.target.value)} 
            placeholder="Subject line recipients will see"
          />
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="design">Design Email</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="code">HTML Code</TabsTrigger>
        </TabsList>
        
        <TabsContent value="design" className="border rounded-md p-1 min-h-[600px]">
          <EmailEditor
            ref={emailEditorRef}
            minHeight="600px"
            options={{
              features: {
                textEditor: {
                  tables: true,
                  alignments: true
                }
              },
              appearance: {
                theme: 'light',
                panels: {
                  tools: {
                    dock: 'left'
                  }
                }
              },
              customCSS: [
                'https://fonts.googleapis.com/css?family=Roboto:300,400,500,700'
              ]
            }}
            tools={{
              image: {
                properties: {
                  src: {
                    value: 'https://www.workshopbase.com.au/logo.png'
                  }
                }
              }
            }}
          />
        </TabsContent>
        
        <TabsContent value="preview">
          <Card>
            <CardHeader>
              <CardTitle>Email Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <iframe 
                id="email-preview-frame"
                className="w-full min-h-[600px] border rounded-md"
                title="Email Preview"
                srcDoc=""
                ref={(frame) => {
                  if (frame && emailEditorRef.current?.editor) {
                    emailEditorRef.current.editor.exportHtml((data: any) => {
                      frame.srcdoc = data.html;
                    });
                  }
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="code">
          <Card>
            <CardHeader>
              <CardTitle>HTML Code</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <textarea
                  className="w-full h-[600px] font-mono text-sm p-4 border rounded-md"
                  readOnly
                  id="html-code-display"
                  ref={(textarea) => {
                    if (textarea && emailEditorRef.current?.editor) {
                      emailEditorRef.current.editor.exportHtml((data: any) => {
                        textarea.value = data.html;
                      });
                    }
                  }}
                />
                <Button
                  className="absolute top-2 right-2"
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    const textarea = document.getElementById('html-code-display') as HTMLTextAreaElement;
                    if (textarea) {
                      textarea.select();
                      document.execCommand('copy');
                      toast({
                        title: 'Copied!',
                        description: 'HTML code copied to clipboard',
                      });
                    }
                  }}
                >
                  Copy HTML
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={handleCancel}>Cancel</Button>
        <Button onClick={saveTemplate} disabled={isSaving}>
          {isSaving ? 'Saving...' : mode === 'template' ? 'Save Template' : 'Create Campaign'}
        </Button>
      </div>
    </div>
  );
};

export default EmailDesigner;
