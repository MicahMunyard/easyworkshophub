
import React, { useState } from "react";
import { EmailTemplateListProps } from "./types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format, isValid, parseISO } from "date-fns";
import { FileText, Edit, Copy, Plus, Calendar } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import EmailTemplateEditor from "./EmailTemplateEditor";
import { useEmailMarketing } from "./useEmailMarketing";
import EmailTesting from "./EmailTesting";

const EmailTemplateList: React.FC<EmailTemplateListProps> = ({ templates, isLoading, onSave }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    subject: "",
    content: "",
    category: "service"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { sendTestEmail } = useEmailMarketing();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.subject || !formData.content) return;
    
    setIsSubmitting(true);
    try {
      await onSave({
        name: formData.name,
        description: formData.description,
        subject: formData.subject,
        content: formData.content,
        category: formData.category as "service" | "promotion" | "newsletter" | "reminder" | "other"
      });
      
      // Reset form and close dialog
      setFormData({
        name: "",
        description: "",
        subject: "",
        content: "",
        category: "service"
      });
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error creating template:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(template);
      setIsEditorOpen(true);
    }
  };

  const handleDuplicateTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      const duplicatedTemplate = {
        ...template,
        name: `Copy of ${template.name}`
      };
      setSelectedTemplate(duplicatedTemplate);
      setIsEditorOpen(true);
    }
  };

  const handleCreateNewTemplate = () => {
    setSelectedTemplate(null);
    setIsEditorOpen(true);
  };

  const handleSaveTemplate = async (template: any) => {
    try {
      return await onSave(template);
    } catch (error) {
      console.error("Error saving template:", error);
      return false;
    }
  };

  const handleSendTest = async (recipients: string[], options: any) => {
    if (!selectedTemplate) {
      return { success: false, message: "No template selected for testing" };
    }
    
    return await sendTestEmail(recipients, {
      subject: selectedTemplate.subject,
      content: selectedTemplate.content,
      note: options.note
    });
  };

  const getCategoryLabel = (category: string) => {
    const categories = {
      service: "Service",
      promotion: "Promotion",
      newsletter: "Newsletter",
      reminder: "Reminder",
      other: "Other"
    };
    return categories[category as keyof typeof categories] || category;
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      service: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300",
      promotion: "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300",
      newsletter: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300",
      reminder: "bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300",
      other: "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300"
    };
    return colors[category as keyof typeof colors] || colors.other;
  };

  // Format date safely with validation
  const formatDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      if (!isValid(date)) {
        return "Invalid date";
      }
      return format(date, "MMM d, yyyy");
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid date";
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Loading templates...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Template editor modal */}
      <EmailTemplateEditor
        template={selectedTemplate}
        onSave={handleSaveTemplate}
        onCancel={() => setSelectedTemplate(null)}
        isOpen={isEditorOpen}
        onOpenChange={setIsEditorOpen}
      />

      <div className="flex justify-between items-center">
        <Button className="flex items-center gap-1" onClick={handleCreateNewTemplate}>
          <Plus className="h-4 w-4" />
          New Template
        </Button>
        
        {selectedTemplate && (
          <EmailTesting 
            emailSubject={selectedTemplate.subject}
            emailContent={selectedTemplate.content}
            onSendTest={handleSendTest}
            isSubmitting={isSubmitting}
          />
        )}
      </div>

      {templates.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No templates available. Create your first template.</p>
        </div>
      ) : (
        <div className="border rounded-md overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Template</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates.map((template) => (
                <TableRow key={template.id} onClick={() => setSelectedTemplate(template)} className="cursor-pointer">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <FileText className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">{template.name}</div>
                        <div className="text-xs text-muted-foreground">{template.description}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${getCategoryColor(template.category)}`}>
                      {getCategoryLabel(template.category)}
                    </span>
                  </TableCell>
                  <TableCell>{template.subject}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {formatDate(template.updated_at)}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditTemplate(template.id);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDuplicateTemplate(template.id);
                        }}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default EmailTemplateList;
