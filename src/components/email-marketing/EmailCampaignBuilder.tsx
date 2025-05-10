
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { EmailTemplate, EmailCampaign } from './types';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useSendgridEmail } from '@/hooks/email/useSendgridEmail';

interface EmailCampaignBuilderProps {
  templates: EmailTemplate[];
  onSave: (campaign: Omit<EmailCampaign, 'id' | 'createdAt' | 'status'>) => Promise<boolean>;
}

const EmailCampaignBuilder: React.FC<EmailCampaignBuilderProps> = ({
  templates,
  onSave
}) => {
  const [subject, setSubject] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [templateId, setTemplateId] = useState<string>('');
  const [audienceType, setAudienceType] = useState<'all' | 'segment'>('all');
  const [segmentIds, setSegmentIds] = useState<string[]>([]);
  const [sendImmediately, setSendImmediately] = useState<boolean>(true);
  const [scheduledDate, setScheduledDate] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('template');
  
  const { isConfigured } = useSendgridEmail();

  const handleTemplateChange = (id: string) => {
    setTemplateId(id);
    if (id) {
      const selectedTemplate = templates.find(t => t.id === id);
      if (selectedTemplate) {
        setSubject(selectedTemplate.subject);
      }
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value === 'template') {
      // Clear custom content when switching to template
      if (templateId) {
        const selectedTemplate = templates.find(t => t.id === templateId);
        if (selectedTemplate) {
          setContent('');
        }
      }
    } else {
      // Clear template selection when switching to custom
      setTemplateId('');
    }
  };

  const handleSave = async () => {
    // Validate required fields
    if (!subject) {
      alert('Subject is required');
      return;
    }
    
    if (activeTab === 'custom' && !content) {
      alert('Email content is required');
      return;
    }
    
    if (!sendImmediately && !scheduledDate) {
      alert('Please select a scheduled date');
      return;
    }
    
    const campaignData: Omit<EmailCampaign, 'id' | 'createdAt' | 'status'> = {
      subject,
      content: activeTab === 'custom' ? content : '',
      templateId: activeTab === 'template' ? templateId : undefined,
      audienceType,
      segmentIds: audienceType === 'segment' ? segmentIds : undefined,
      sendImmediately,
      scheduledDate: !sendImmediately ? scheduledDate : undefined
    };
    
    const success = await onSave(campaignData);
    
    if (success) {
      // Reset form after successful save
      setSubject('');
      setContent('');
      setTemplateId('');
      setAudienceType('all');
      setSegmentIds([]);
      setSendImmediately(true);
      setScheduledDate('');
      setActiveTab('template');
    }
  };

  return (
    <div className="space-y-6">
      {!isConfigured && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>SendGrid Not Configured</AlertTitle>
          <AlertDescription>
            Email sending is not available. Please add a valid SendGrid API key to your environment variables.
          </AlertDescription>
        </Alert>
      )}
    
      <div className="grid gap-4">
        <div className="space-y-2">
          <Label htmlFor="subject">Email Subject</Label>
          <Input
            id="subject"
            placeholder="Enter email subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="template">Use Template</TabsTrigger>
            <TabsTrigger value="custom">Custom Content</TabsTrigger>
          </TabsList>
          <TabsContent value="template" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="template">Select Template</Label>
              <Select value={templateId} onValueChange={handleTemplateChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a template" />
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
            
            {templateId && templates.find(t => t.id === templateId) && (
              <Card>
                <CardContent className="p-4 bg-muted/50">
                  <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ 
                    __html: templates.find(t => t.id === templateId)?.content || '' 
                  }} />
                </CardContent>
              </Card>
            )}
          </TabsContent>
          <TabsContent value="custom" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="content">Email Content</Label>
              <Textarea
                id="content"
                placeholder="Enter email content (supports HTML)"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[200px]"
              />
            </div>
          </TabsContent>
        </Tabs>

        <div className="space-y-2 pt-4">
          <Label>Audience</Label>
          <Select value={audienceType} onValueChange={(value: 'all' | 'segment') => setAudienceType(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select audience" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Customers</SelectItem>
              <SelectItem value="segment">Customer Segment</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {audienceType === 'segment' && (
          <div className="space-y-2">
            <Label htmlFor="segment">Customer Segment</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select segment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Recent Customers</SelectItem>
                <SelectItem value="loyal">Loyal Customers</SelectItem>
                <SelectItem value="inactive">Inactive Customers</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="flex items-center justify-between space-y-0 pt-4">
          <Label htmlFor="send-immediately">Send immediately</Label>
          <Switch
            id="send-immediately"
            checked={sendImmediately}
            onCheckedChange={setSendImmediately}
          />
        </div>

        {!sendImmediately && (
          <div className="space-y-2">
            <Label htmlFor="scheduled-date">Schedule Date</Label>
            <Input
              id="scheduled-date"
              type="datetime-local"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
            />
          </div>
        )}

        <Button
          onClick={handleSave}
          className="w-full mt-4"
          disabled={!isConfigured}
        >
          {sendImmediately ? 'Send Campaign Now' : 'Schedule Campaign'}
        </Button>
      </div>
    </div>
  );
};

export default EmailCampaignBuilder;
