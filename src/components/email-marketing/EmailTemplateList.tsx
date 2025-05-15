
import React, { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { EmailTemplate } from "./types";
import { useEmailErrors, handleApiError } from "./EmailErrorProvider";
import EmailTesting from "./EmailTesting";

interface EmailTemplateListProps {
  templates: EmailTemplate[];
  isLoading: boolean;
  onSave: (template: Omit<EmailTemplate, 'id' | 'created_at' | 'updated_at'>) => Promise<boolean>;
  onTestEmail?: (recipients: string[], options: any) => Promise<{ success: boolean; message?: string }>;
}

const EmailTemplateList: React.FC<EmailTemplateListProps> = ({ 
  templates, 
  isLoading, 
  onSave,
  onTestEmail 
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<"service" | "promotion" | "newsletter" | "reminder" | "other">("service");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const { addError } = useEmailErrors();
  const { toast } = useToast();

  const resetForm = () => {
    setName("");
    setDescription("");
    setSubject("");
    setContent("");
    setCategory("service");
  };

  const handleOpenDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!name || !subject || !content) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const newTemplate: Omit<EmailTemplate, 'id' | 'created_at' | 'updated_at'> = {
        name,
        subject,
        content,
        category,
        description
      };

      const success = await onSave(newTemplate);
      if (success) {
        setIsDialogOpen(false);
        resetForm();
        toast({
          title: "Template created",
          description: "Your email template has been created successfully",
        });
      }
    } catch (error) {
      toast({
        title: "Failed to create template",
        description: "There was an error creating your template",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenTestModal = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setIsTestModalOpen(true);
  };

  const handleSendTest = async (recipients: string[], options: any) => {
    if (!selectedTemplate || !onTestEmail) {
      return { 
        success: false, 
        message: "Unable to send test email. Template or test function not available." 
      };
    }

    try {
      const result = await onTestEmail(recipients, {
        subject: selectedTemplate.subject,
        content: selectedTemplate.content,
        note: options.note
      });
      
      return result;
    } catch (error) {
      // Simplified error handling
      handleApiError(error, addError, "EmailTemplateList", async () => {
        if (selectedTemplate && onTestEmail) {
          await onTestEmail(recipients, {
            subject: selectedTemplate.subject,
            content: selectedTemplate.content,
            note: options.note
          });
        }
      });
      
      return { 
        success: false, 
        message: error instanceof Error ? error.message : "Failed to send test email" 
      };
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold">Email Templates</h2>
          <p className="text-sm text-muted-foreground">
            Manage and create email templates for your campaigns
          </p>
        </div>
        <Button 
          onClick={handleOpenDialog}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Template
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-5 bg-muted rounded w-1/3"></div>
                <div className="h-4 bg-muted rounded w-1/2 mt-2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-muted rounded w-full mb-3"></div>
                <div className="h-4 bg-muted rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          {templates.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="mx-auto bg-muted rounded-full w-12 h-12 flex items-center justify-center mb-4">
                  <Mail className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="font-medium text-lg mb-2">No templates yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first email template to start designing your campaigns
                </p>
                <Button onClick={handleOpenDialog}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Template
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {templates.map((template) => (
                <Card key={template.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{template.name}</CardTitle>
                        <CardDescription>
                          {template.description || 'No description'}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Subject</p>
                      <p className="text-sm text-muted-foreground">{template.subject}</p>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end gap-2">
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                    <Button 
                      variant="secondary" 
                      size="sm"
                      onClick={() => handleOpenTestModal(template)}
                    >
                      Test Email
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Email Template</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Template Name*</Label>
              <Input 
                id="name" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="Service Reminder" 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea 
                id="description" 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                placeholder="Brief description of this template..."
                rows={2}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="subject">Subject*</Label>
              <Input 
                id="subject" 
                value={subject} 
                onChange={(e) => setSubject(e.target.value)} 
                placeholder="Your vehicle is due for service" 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="content">Content*</Label>
              <Textarea 
                id="content" 
                value={content} 
                onChange={(e) => setContent(e.target.value)} 
                placeholder="<p>Hello {{customer_name}},</p><p>Your {{vehicle}} is due for service on {{service_date}}.</p>"
                rows={4}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Category*</Label>
              <Select value={category} onValueChange={(value) => setCategory(value as any)}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="service">Service</SelectItem>
                  <SelectItem value="promotion">Promotion</SelectItem>
                  <SelectItem value="newsletter">Newsletter</SelectItem>
                  <SelectItem value="reminder">Reminder</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Template'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {selectedTemplate && onTestEmail && (
        <EmailTesting 
          emailSubject={selectedTemplate.subject}
          emailContent={selectedTemplate.content}
          onSendTest={handleSendTest}
          isSubmitting={false}
        />
      )}
    </div>
  );
};

export default EmailTemplateList;
