import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useEmailSignatures, EmailSignature } from '@/hooks/email/useEmailSignatures';

interface EmailSignatureEditorProps {
  signature?: EmailSignature;
  onSave: () => void;
  onCancel: () => void;
}

const EmailSignatureEditor: React.FC<EmailSignatureEditorProps> = ({
  signature,
  onSave,
  onCancel,
}) => {
  const [name, setName] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const { createSignature, updateSignature, generatePlainTextFromHtml } = useEmailSignatures();

  useEffect(() => {
    if (signature) {
      setName(signature.name);
      setHtmlContent(signature.html_content);
      setIsDefault(signature.is_default);
    }
  }, [signature]);

  const handleSave = async () => {
    const plainText = generatePlainTextFromHtml(htmlContent);
    
    if (signature) {
      await updateSignature(signature.id, {
        name,
        html_content: htmlContent,
        plain_text_content: plainText,
        is_default: isDefault,
      });
    } else {
      await createSignature(name, htmlContent, plainText, isDefault);
    }
    
    onSave();
  };

  const insertVariable = (variable: string) => {
    setHtmlContent(prev => prev + variable);
  };

  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'align': [] }],
      ['link', 'image'],
      ['clean']
    ],
  };

  const variables = [
    { label: 'Workshop Name', value: '{{workshop_name}}' },
    { label: 'Full Name', value: '{{full_name}}' },
    { label: 'Phone Number', value: '{{phone_number}}' },
    { label: 'Email', value: '{{email}}' },
    { label: 'Website', value: '{{website}}' },
    { label: 'Address', value: '{{address}}' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{signature ? 'Edit' : 'Create'} Email Signature</CardTitle>
        <CardDescription>
          Design your professional email signature with custom formatting
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="signature-name">Signature Name</Label>
          <Input
            id="signature-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Professional, Casual, Marketing"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="default-signature"
            checked={isDefault}
            onCheckedChange={setIsDefault}
          />
          <Label htmlFor="default-signature">Set as default signature</Label>
        </div>

        <Tabs defaultValue="editor" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="editor">Visual Editor</TabsTrigger>
            <TabsTrigger value="html">HTML</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          <TabsContent value="editor" className="space-y-4">
            <div>
              <Label>Template Variables</Label>
              <div className="flex flex-wrap gap-2 mt-2 mb-4">
                {variables.map((variable) => (
                  <Button
                    key={variable.value}
                    variant="outline"
                    size="sm"
                    type="button"
                    onClick={() => insertVariable(variable.value)}
                  >
                    {variable.label}
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="min-h-[300px]">
              <ReactQuill
                theme="snow"
                value={htmlContent}
                onChange={setHtmlContent}
                modules={quillModules}
                className="bg-background"
              />
            </div>
          </TabsContent>

          <TabsContent value="html">
            <Textarea
              value={htmlContent}
              onChange={(e) => setHtmlContent(e.target.value)}
              className="min-h-[300px] font-mono text-sm"
              placeholder="<p>Your HTML signature here...</p>"
            />
          </TabsContent>

          <TabsContent value="preview">
            <Card>
              <CardContent className="pt-6">
                <div 
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: htmlContent }}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!name.trim() || !htmlContent.trim()}>
            {signature ? 'Update' : 'Create'} Signature
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmailSignatureEditor;
