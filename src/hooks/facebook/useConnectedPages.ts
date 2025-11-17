import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

export interface ConnectedPage {
  id: string;
  page_id: string;
  page_name: string;
  created_at: string;
  access_token: string;
  user_id: string;
  updated_at: string;
}

export const useConnectedPages = () => {
  const { user } = useAuth();
  const [pages, setPages] = useState<ConnectedPage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPages = async () => {
    if (!user) {
      setPages([]);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('facebook_page_tokens')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setPages(data || []);
    } catch (error) {
      console.error('Error fetching connected pages:', error);
      toast({
        variant: "destructive",
        title: "Failed to load connected pages",
        description: "There was a problem loading your Facebook pages."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectPage = async (pageId: string) => {
    if (!user) return;

    try {
      // Delete the page token
      const { error: deleteError } = await supabase
        .from('facebook_page_tokens')
        .delete()
        .eq('id', pageId)
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;

      // Check if there are any remaining pages
      const { data: remainingPages } = await supabase
        .from('facebook_page_tokens')
        .select('id')
        .eq('user_id', user.id);

      // If no pages left, remove the social connection
      if (!remainingPages || remainingPages.length === 0) {
        await supabase
          .from('social_connections')
          .delete()
          .eq('user_id', user.id)
          .eq('platform', 'facebook');
      }

      toast({
        title: "Page disconnected",
        description: "Facebook page has been disconnected successfully."
      });

      // Refresh the list
      fetchPages();
    } catch (error) {
      console.error('Error disconnecting page:', error);
      toast({
        variant: "destructive",
        title: "Failed to disconnect page",
        description: "There was a problem disconnecting the Facebook page."
      });
    }
  };

  useEffect(() => {
    fetchPages();

    // Set up real-time subscription
    const channel = supabase
      .channel('facebook_page_tokens_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'facebook_page_tokens',
          filter: `user_id=eq.${user?.id}`
        },
        () => {
          console.log('Facebook page tokens changed, refreshing...');
          fetchPages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return { pages, isLoading, disconnectPage, refetch: fetchPages };
};
