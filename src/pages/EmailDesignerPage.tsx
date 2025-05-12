
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import EmailDesigner from '@/components/email-marketing/EmailDesigner';
import { useEmailTemplates } from '@/hooks/email/useEmailTemplates';
import { useEmailMarketing } from '@/components/email-marketing/useEmailMarketing';
import { useToast } from '@/hooks/use-toast';

const EmailDesignerPage = () => {
  const navigate = useNavigate();
  const { mode, id } = useParams<{ mode: 'template' | 'campaign'; id?: string }>();
  const { toast } = useToast();
  
  const { templates, createTemplate } = useEmailTemplates();
  const { createCampaign } = useEmailMarketing();
  
  // Find template if editing an existing one
  const initialTemplate = id ? templates.find(t => t.id === id) : undefined;
  
  const handleSave = async (template: { name: string; subject: string; content: string }) => {
    try {
      if (mode === 'template') {
        const templateId = await createTemplate(
          template.name,
          template.subject,
          template.content,
          'html',
          false
        );
        
        return !!templateId;
      } else {
        // Handle campaign creation
        const success = await createCampaign({
          name: template.name,
          subject: template.subject,
          content: template.content
          // Remove the recipients property as it doesn't exist on the expected type
          // scheduled_for is optional so we can leave it out
        });
        
        return success;
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save ' + (mode === 'template' ? 'template' : 'campaign'),
        variant: 'destructive'
      });
      return false;
    }
  };
  
  const handleCancel = () => {
    navigate('/email-marketing');
  };
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{mode === 'template' ? 'Design Email Template' : 'Design Email Campaign'}</h1>
      </div>
      
      <EmailDesigner
        initialTemplate={initialTemplate ? {
          name: initialTemplate.name,
          subject: initialTemplate.subject,
          content: initialTemplate.content || '' // Provide a default empty string if content is missing
        } : undefined}
        mode={mode || 'template'}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default EmailDesignerPage;
