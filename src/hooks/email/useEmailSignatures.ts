import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface EmailSignature {
  id: string;
  user_id: string;
  name: string;
  html_content: string;
  plain_text_content: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export const useEmailSignatures = () => {
  const [signatures, setSignatures] = useState<EmailSignature[]>([]);
  const [defaultSignature, setDefaultSignature] = useState<EmailSignature | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchSignatures = async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('email_signatures')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setSignatures(data || []);
      const defaultSig = data?.find(sig => sig.is_default) || null;
      setDefaultSignature(defaultSig);
    } catch (error: any) {
      console.error('Error fetching signatures:', error);
      toast({
        title: 'Error',
        description: 'Failed to load email signatures',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createSignature = async (
    name: string,
    htmlContent: string,
    plainTextContent: string,
    isDefault: boolean = false
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // If setting as default, unset other defaults first
      if (isDefault) {
        await supabase
          .from('email_signatures')
          .update({ is_default: false })
          .eq('user_id', user.id)
          .eq('is_default', true);
      }

      const { data, error } = await supabase
        .from('email_signatures')
        .insert({
          user_id: user.id,
          name,
          html_content: htmlContent,
          plain_text_content: plainTextContent,
          is_default: isDefault,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Email signature created successfully',
      });

      await fetchSignatures();
      return data;
    } catch (error: any) {
      console.error('Error creating signature:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create email signature',
        variant: 'destructive',
      });
      return null;
    }
  };

  const updateSignature = async (
    id: string,
    updates: Partial<Omit<EmailSignature, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // If setting as default, unset other defaults first
      if (updates.is_default) {
        await supabase
          .from('email_signatures')
          .update({ is_default: false })
          .eq('user_id', user.id)
          .eq('is_default', true)
          .neq('id', id);
      }

      const { error } = await supabase
        .from('email_signatures')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Email signature updated successfully',
      });

      await fetchSignatures();
      return true;
    } catch (error: any) {
      console.error('Error updating signature:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update email signature',
        variant: 'destructive',
      });
      return false;
    }
  };

  const deleteSignature = async (id: string) => {
    try {
      const { error } = await supabase
        .from('email_signatures')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Email signature deleted successfully',
      });

      await fetchSignatures();
      return true;
    } catch (error: any) {
      console.error('Error deleting signature:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete email signature',
        variant: 'destructive',
      });
      return false;
    }
  };

  const setAsDefault = async (id: string) => {
    return updateSignature(id, { is_default: true });
  };

  const generatePlainTextFromHtml = (html: string): string => {
    // Remove HTML tags and decode entities
    const text = html
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .trim();
    return text;
  };

  useEffect(() => {
    fetchSignatures();
  }, []);

  return {
    signatures,
    defaultSignature,
    isLoading,
    fetchSignatures,
    createSignature,
    updateSignature,
    deleteSignature,
    setAsDefault,
    generatePlainTextFromHtml,
  };
};
