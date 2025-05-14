
import React, { useState, useEffect, lazy, Suspense } from "react";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

// Dynamically import the email editor component
const EmailEditor = lazy(() => import('react-email-editor').then(module => ({ default: module.default })));

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

const EmailDesigner: React.FC<EmailDesignerProps> = ({ 
  initialTemplate,
  onSave,
  mode,
  onCancel
}) => {
  const emailEditorRef = React.useRef<any>(null);
  const [name, setName] = useState(initialTemplate?.name || '');
  const [subject, setSubject] = useState(initialTemplate?.subject || '');
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('design');
  const [editorLoaded, setEditorLoaded] = useState(false);
  const { toast } = useToast();
  
  // Load template into editor when available
  useEffect(() => {
    if (initialTemplate?.content && emailEditorRef.current?.editor && editorLoaded) {
      try {
        // Try loading as JSON design
        const contentObj = JSON.parse(initialTemplate.content);
        if (contentObj.design) {
          emailEditorRef.current.editor.loadDesign(contentObj.design);
        } else if (contentObj.html) {
          emailEditorRef.current.editor.loadHTML(contentObj.html);
        }
      } catch (e) {
        // Fallback to loading as HTML
        emailEditorRef.current.editor.loadHTML(initialTemplate.content);
        console.log("Loaded as HTML instead of JSON design", e);
      }
    }
  }, [initialTemplate, editorLoaded]);
  
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
        
        // Ensure the content is properly saved and can be loaded later
        const contentObj = {
          html,
          design
        };
        
        // Convert to string but ensure it's valid by testing parse
        const contentStr = JSON.stringify(contentObj);
        // Validate it can be parsed back
        JSON.parse(contentStr);
        
        const success = await onSave({
          name, 
          subject,
          content: contentStr
        });
        
        if (success) {
          toast({
            title: mode === 'template' ? 'Template saved' : 'Campaign created',
            description: mode === 'template' ? 'Email template saved successfully' : 'Email campaign ready to send',
          });
        } else {
          throw new Error("Failed to save template");
        }
      });
    } catch (error) {
      console.error("Error saving email design:", error);
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

  const handleEditorReady = () => {
    setEditorLoaded(true);
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
          <div id="emailEditorContainer" className="h-[600px]">
            <Suspense fallback={<Skeleton className="w-full h-[600px]" />}>
              <EmailEditor
                ref={emailEditorRef}
                onReady={handleEditorReady}
                minHeight="600px"
                options={{
                  features: {
                    textEditor: {
                      tables: true
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
            </Suspense>
          </div>
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
                  if (frame && emailEditorRef.current?.editor && editorLoaded) {
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
                    if (textarea && emailEditorRef.current?.editor && editorLoaded) {
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
