
import React, { useState, useEffect } from "react";
import { EmailTemplate } from "./types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Import React Quill for rich text editing
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface EmailTemplateEditorProps {
  template?: EmailTemplate;
  onSave: (template: Omit<EmailTemplate, 'id' | 'created_at' | 'updated_at'>) => Promise<boolean>;
  onCancel: () => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

// Sample customer data for previewing
const sampleCustomer = {
  name: "John Smith",
  vehicle: "2020 Toyota Camry",
  service_date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
  workshop_name: "Your Workshop",
  service_type: "Annual Service",
  expiry_date: new Date(new Date().setDate(new Date().getDate() + 30)).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
};

// Placeholder image data
const placeholderImage = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='100' viewBox='0 0 200 100'%3E%3Crect width='200' height='100' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='14' fill='%23999999'%3EWorkshop Logo%3C/text%3E%3C/svg%3E";

const EmailTemplateEditor: React.FC<EmailTemplateEditorProps> = ({ 
  template, 
  onSave, 
  onCancel,
  isOpen,
  onOpenChange
}) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    subject: "",
    content: "",
    category: "service"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("editor");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showValidationTips, setShowValidationTips] = useState(false);

  // Quill editor modules/formats
  const editorModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'color': [] }, { 'background': [] }],
      ['link', 'image'],
      [{ 'align': [] }],
      ['clean']
    ],
  };

  useEffect(() => {
    if (template) {
      setFormData({
        name: template.name,
        description: template.description || "",
        subject: template.subject,
        content: template.content,
        category: template.category || "service"
      });
    } else {
      setFormData({
        name: "",
        description: "",
        subject: "",
        content: getDefaultTemplate(),
        category: "service"
      });
    }
  }, [template, isOpen]);

  const getDefaultTemplate = () => {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="text-align: center; padding: 20px;">
          <img src="${placeholderImage}" alt="Workshop Logo" style="max-width: 200px;">
        </div>
        <div style="padding: 20px; background-color: #f7f7f7;">
          <h1 style="color: #333;">Hello {{customer_name}},</h1>
          <p>Thank you for choosing {{workshop_name}} for your vehicle needs.</p>
          <p>Your {{service_type}} for your {{vehicle}} is scheduled for {{service_date}}.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="#" style="background-color: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">View Details</a>
          </div>
          <p>If you need to reschedule, please contact us as soon as possible.</p>
          <p>Best regards,<br>The Team at {{workshop_name}}</p>
        </div>
        <div style="padding: 15px; text-align: center; font-size: 12px; color: #666;">
          <p>© 2025 {{workshop_name}}. All rights reserved.</p>
        </div>
      </div>
    `;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleEditorChange = (value: string) => {
    setFormData(prev => ({ ...prev, content: value }));
    
    // Clear error for content if it exists
    if (errors.content) {
      setErrors(prev => {
        const newErrors = {...prev};
        delete newErrors.content;
        return newErrors;
      });
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Template name is required";
    }
    
    if (!formData.subject.trim()) {
      newErrors.subject = "Email subject is required";
    }
    
    if (!formData.content.trim()) {
      newErrors.content = "Email content is required";
    } else {
      // Check if all required placeholders are in the content
      const requiredPlaceholders = ["{{workshop_name}}"];
      for (const placeholder of requiredPlaceholders) {
        if (!formData.content.includes(placeholder)) {
          newErrors.content = `Template must include ${placeholder}`;
          break;
        }
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setShowValidationTips(true);
      return;
    }
    
    setIsSubmitting(true);
    try {
      const success = await onSave({
        name: formData.name,
        description: formData.description,
        subject: formData.subject,
        content: formData.content,
        category: formData.category as "service" | "promotion" | "newsletter" | "reminder" | "other"
      });
      
      if (success) {
        onOpenChange(false);
      }
    } catch (error) {
      console.error("Error saving template:", error);
      setErrors({ submit: "Failed to save template. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Process the template with sample data for preview
  const getPreviewContent = () => {
    let processedContent = formData.content;
    
    // Replace placeholders with sample data
    Object.entries(sampleCustomer).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      processedContent = processedContent.replace(new RegExp(placeholder, 'g'), value);
    });
    
    return processedContent;
  };

  // Template suggestions based on the selected category
  const getTemplateSuggestions = () => {
    const suggestions = {
      service: [
        { name: "Service Reminder", description: "Remind customers about upcoming service" },
        { name: "Service Confirmation", description: "Confirm scheduled service appointments" },
        { name: "Service Follow-up", description: "Follow up after completed service" }
      ],
      promotion: [
        { name: "Seasonal Offer", description: "Promote seasonal service specials" },
        { name: "Limited Time Discount", description: "Announce limited-time promotions" },
        { name: "New Service Introduction", description: "Introduce new services" }
      ],
      newsletter: [
        { name: "Monthly Newsletter", description: "Regular updates and car care tips" },
        { name: "Industry News", description: "Automotive industry updates" }
      ],
      reminder: [
        { name: "Registration Renewal", description: "Remind about vehicle registration" },
        { name: "Inspection Due", description: "Notify about upcoming inspections" }
      ]
    };
    
    return suggestions[formData.category as keyof typeof suggestions] || [];
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{template ? "Edit" : "Create"} Email Template</DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="editor">Template Editor</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="editor">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Template Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter template name"
                    className={errors.name ? "border-red-500" : ""}
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => handleSelectChange("category", value)}
                  >
                    <SelectTrigger>
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
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter template description"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="subject">Email Subject</Label>
                <Input
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  placeholder="Enter email subject"
                  className={errors.subject ? "border-red-500" : ""}
                />
                {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject}</p>}
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="content">Email Content</Label>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setShowValidationTips(!showValidationTips)}
                  >
                    {showValidationTips ? "Hide Tips" : "Show Tips"}
                  </Button>
                </div>
                
                {showValidationTips && (
                  <Alert className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      <p>Available placeholders:</p>
                      <ul className="mt-1 pl-4 list-disc">
                        <li>&#123;&#123;customer_name&#125;&#125; - Customer's name</li>
                        <li>&#123;&#123;vehicle&#125;&#125; - Customer's vehicle</li>
                        <li>&#123;&#123;service_date&#125;&#125; - Date of service</li>
                        <li>&#123;&#123;workshop_name&#125;&#125; - Your workshop name</li>
                        <li>&#123;&#123;service_type&#125;&#125; - Type of service</li>
                        <li>&#123;&#123;expiry_date&#125;&#125; - Expiration date</li>
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}
                
                <div className={errors.content ? "border border-red-500 rounded-md" : ""}>
                  <ReactQuill 
                    value={formData.content} 
                    onChange={handleEditorChange}
                    modules={editorModules}
                    theme="snow"
                    placeholder="Enter email content"
                    className="h-64 mb-12"
                  />
                </div>
                {errors.content && <p className="text-red-500 text-xs mt-1">{errors.content}</p>}
              </div>
              
              {errors.submit && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errors.submit}</AlertDescription>
                </Alert>
              )}
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    onOpenChange(false);
                    onCancel();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving..." : "Save Template"}
                </Button>
              </div>
            </form>
          </TabsContent>
          
          <TabsContent value="preview">
            <div className="space-y-4">
              <div className="p-4 border rounded-md">
                <div className="font-semibold pb-2">Preview Subject:</div>
                <div className="p-2 bg-muted rounded-md">{formData.subject || "[No subject]"}</div>
              </div>
              
              <div className="border rounded-md">
                <div className="p-4 border-b">
                  <div className="font-semibold">Preview Content:</div>
                </div>
                <div className="p-4 bg-white">
                  <div 
                    className="email-preview"
                    dangerouslySetInnerHTML={{ __html: getPreviewContent() }}
                  />
                </div>
              </div>
              
              <div className="flex justify-between pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setActiveTab("editor")}
                >
                  Back to Editor
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="suggestions">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Here are some template suggestions based on your selected category.
                Click on a template to use it as a starting point.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {getTemplateSuggestions().map((suggestion, index) => (
                  <Card 
                    key={index}
                    className="cursor-pointer hover:bg-muted transition-colors"
                    onClick={() => {
                      // In a real implementation, this would load a template
                      setFormData(prev => ({
                        ...prev,
                        name: suggestion.name,
                        description: suggestion.description
                      }));
                      setActiveTab("editor");
                    }}
                  >
                    <CardContent className="p-4">
                      <h3 className="font-semibold">{suggestion.name}</h3>
                      <p className="text-sm text-muted-foreground">{suggestion.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <div className="flex justify-end pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setActiveTab("editor")}
                >
                  Back to Editor
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default EmailTemplateEditor;
