
import React, { useState } from "react";
import { EmailCampaignBuilderProps } from "./types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Calendar as CalendarIcon, 
  Check, 
  Clock, 
  Users,
  Send,
  SaveIcon 
} from "lucide-react";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";

const EmailCampaignBuilder: React.FC<EmailCampaignBuilderProps> = ({ templates, onSave }) => {
  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    template_id: "",
    content: "",
    recipient_segments: ["all"],
    scheduled_for: "",
    schedule: false
  });
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewMode, setPreviewMode] = useState("desktop");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    if (name === "template_id") {
      const selectedTemplate = templates.find(t => t.id === value);
      setFormData(prev => ({ 
        ...prev, 
        [name]: value,
        subject: selectedTemplate?.subject || prev.subject,
        content: selectedTemplate?.content || prev.content
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSegmentChange = (segment: string) => {
    setFormData(prev => {
      const segments = [...prev.recipient_segments];
      
      if (segment === "all") {
        return { ...prev, recipient_segments: ["all"] };
      }
      
      if (segments.includes(segment)) {
        const newSegments = segments.filter(s => s !== segment);
        return { ...prev, recipient_segments: newSegments.length ? newSegments : ["all"] };
      } else {
        const newSegments = segments.filter(s => s !== "all").concat(segment);
        return { ...prev, recipient_segments: newSegments };
      }
    });
  };

  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    setFormData(prev => ({ 
      ...prev, 
      scheduled_for: selectedDate ? selectedDate.toISOString() : "" 
    }));
  };

  const handleScheduleToggle = (checked: boolean) => {
    setFormData(prev => ({ ...prev, schedule: checked }));
    if (!checked) {
      setFormData(prev => ({ ...prev, scheduled_for: "" }));
      setDate(undefined);
    }
  };

  const handleSubmit = async (e: React.FormEvent, isDraft: boolean = false) => {
    e.preventDefault();
    if (!formData.name || !formData.subject || !formData.template_id) return;
    
    setIsSubmitting(true);
    try {
      await onSave({
        name: formData.name,
        subject: formData.subject,
        template_id: formData.template_id,
        content: formData.content,
        recipient_segments: formData.recipient_segments,
        scheduled_for: formData.schedule ? formData.scheduled_for : undefined
      });
      
      // Reset form
      setFormData({
        name: "",
        subject: "",
        template_id: "",
        content: "",
        recipient_segments: ["all"],
        scheduled_for: "",
        schedule: false
      });
      setDate(undefined);
    } catch (error) {
      console.error("Error creating campaign:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderPreview = () => {
    const selectedTemplate = templates.find(t => t.id === formData.template_id);
    
    if (!selectedTemplate) {
      return (
        <div className="flex items-center justify-center h-full border rounded-md bg-muted/20 p-6">
          <p className="text-muted-foreground">Select a template to preview content</p>
        </div>
      );
    }
    
    const previewContent = selectedTemplate.content
      .replace(/{{customer_name}}/g, "John Smith")
      .replace(/{{vehicle}}/g, "2020 Toyota Camry")
      .replace(/{{service_date}}/g, format(new Date(), "MMMM d, yyyy"))
      .replace(/{{workshop_name}}/g, "TOLICCS Workshop")
      .replace(/{{service_type}}/g, "Full Service")
      .replace(/{{expiry_date}}/g, format(new Date(new Date().setDate(new Date().getDate() + 30)), "MMMM d, yyyy"));
    
    return (
      <div className={`border rounded-md overflow-hidden ${previewMode === "mobile" ? "max-w-[375px] mx-auto" : "w-full"}`}>
        <div className="bg-primary/10 p-3 border-b">
          <div className="text-sm font-medium truncate">{formData.subject || "Email Subject"}</div>
          <div className="text-xs text-muted-foreground">From: TOLICCS Workshop &lt;info@toliccs.com&gt;</div>
        </div>
        <div className="p-4 bg-white" dangerouslySetInnerHTML={{ __html: previewContent }} />
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="content" className="space-y-4">
        <TabsList>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="recipients">Recipients</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>
        
        <TabsContent value="content" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Campaign Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter campaign name"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="template_id">Select Template</Label>
            <Select
              value={formData.template_id}
              onValueChange={(value) => handleSelectChange("template_id", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a template" />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="subject">Email Subject</Label>
            <Input
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleInputChange}
              placeholder="Enter email subject"
              required
            />
          </div>
        </TabsContent>
        
        <TabsContent value="recipients" className="space-y-4">
          <div className="space-y-2">
            <Label>Recipient Segments</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div 
                className={`flex items-center justify-between p-3 rounded-md border cursor-pointer ${formData.recipient_segments.includes("all") ? "bg-primary/10 border-primary" : ""}`}
                onClick={() => handleSegmentChange("all")}
              >
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>All Customers</span>
                </div>
                {formData.recipient_segments.includes("all") && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </div>
              
              <div 
                className={`flex items-center justify-between p-3 rounded-md border cursor-pointer ${formData.recipient_segments.includes("recent") ? "bg-primary/10 border-primary" : ""}`}
                onClick={() => handleSegmentChange("recent")}
              >
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>Recent Customers</span>
                </div>
                {formData.recipient_segments.includes("recent") && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </div>
              
              <div 
                className={`flex items-center justify-between p-3 rounded-md border cursor-pointer ${formData.recipient_segments.includes("inactive") ? "bg-primary/10 border-primary" : ""}`}
                onClick={() => handleSegmentChange("inactive")}
              >
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>Inactive Customers</span>
                </div>
                {formData.recipient_segments.includes("inactive") && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </div>
              
              <div 
                className={`flex items-center justify-between p-3 rounded-md border cursor-pointer ${formData.recipient_segments.includes("high_value") ? "bg-primary/10 border-primary" : ""}`}
                onClick={() => handleSegmentChange("high_value")}
              >
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>High Value Customers</span>
                </div>
                {formData.recipient_segments.includes("high_value") && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </div>
            </div>
          </div>
          
          <div className="text-sm text-muted-foreground">
            {formData.recipient_segments.includes("all") 
              ? "This campaign will be sent to all customers."
              : `This campaign will be sent to customers in the selected segments (${formData.recipient_segments.join(", ")}).`
            }
          </div>
        </TabsContent>
        
        <TabsContent value="schedule" className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch 
              checked={formData.schedule}
              onCheckedChange={handleScheduleToggle}
              id="schedule-toggle"
            />
            <Label htmlFor="schedule-toggle">Schedule for later</Label>
          </div>
          
          {formData.schedule && (
            <div className="space-y-2">
              <Label>Choose date and time</Label>
              <div className="flex flex-col space-y-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={handleDateSelect}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                
                <div className="grid grid-cols-4 gap-2">
                  {["9:00 AM", "12:00 PM", "3:00 PM", "6:00 PM"].map((time) => (
                    <Button
                      key={time}
                      type="button"
                      variant="outline"
                      className={`flex items-center gap-1 ${
                        formData.scheduled_for && formData.scheduled_for.includes(time)
                          ? "bg-primary/10 border-primary"
                          : ""
                      }`}
                      onClick={() => {
                        if (date) {
                          const newDate = new Date(date);
                          const [hours, minutes] = time.split(":")[0].includes("PM")
                            ? [parseInt(time.split(":")[0]) + 12, 0]
                            : [parseInt(time.split(":")[0]), 0];
                          newDate.setHours(hours, minutes, 0, 0);
                          setFormData({ ...formData, scheduled_for: newDate.toISOString() });
                        }
                      }}
                      disabled={!date}
                    >
                      <Clock className="h-3 w-3" />
                      {time}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="preview" className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <div className="text-sm font-medium">Preview</div>
            <div className="flex items-center space-x-2">
              <Button
                variant={previewMode === "desktop" ? "default" : "outline"}
                size="sm"
                onClick={() => setPreviewMode("desktop")}
              >
                Desktop
              </Button>
              <Button
                variant={previewMode === "mobile" ? "default" : "outline"}
                size="sm"
                onClick={() => setPreviewMode("mobile")}
              >
                Mobile
              </Button>
            </div>
          </div>
          
          {renderPreview()}
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button
          variant="outline"
          onClick={(e) => handleSubmit(e, true)}
          disabled={isSubmitting || !formData.name || !formData.subject || !formData.template_id}
          className="flex items-center gap-1"
        >
          <SaveIcon className="h-4 w-4" />
          Save as Draft
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={
            isSubmitting || 
            !formData.name || 
            !formData.subject || 
            !formData.template_id ||
            (formData.schedule && !formData.scheduled_for)
          }
          className="flex items-center gap-1"
        >
          {formData.schedule ? (
            <>
              <Clock className="h-4 w-4" />
              Schedule
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Send Now
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default EmailCampaignBuilder;
