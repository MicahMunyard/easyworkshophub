
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

// Define the type locally since we're having issues with the global declaration
interface FacebookLoginStatus {
  status: 'connected' | 'not_authorized' | 'unknown';
  authResponse?: {
    accessToken: string;
    expiresIn: string;
    signedRequest: string;
    userID: string;
  };
}

export interface FacebookPage {
  id: string;
  name: string;
  access_token: string;
}


export const useFacebookAuth = () => {
  const [fbStatus, setFbStatus] = useState<FacebookLoginStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [availablePages, setAvailablePages] = useState<FacebookPage[]>([]);
  const [showPageSelector, setShowPageSelector] = useState(false);
  const [userAccessToken, setUserAccessToken] = useState<string>('');
  const { toast } = useToast();

  const checkLoginStatus = () => {
    console.log('🔍 Checking Facebook SDK status...');
    console.log('window.FB available:', typeof window !== 'undefined' && !!window.FB);
    
    if (typeof window !== 'undefined' && window.FB) {
      console.log('✅ Facebook SDK loaded, checking login status...');
      
      const timeoutId = setTimeout(() => {
        console.warn('⏱️ Facebook status check timed out after 5 seconds');
        setIsLoading(false);
      }, 5000);
      
      window.FB.getLoginStatus((response: FacebookLoginStatus) => {
        clearTimeout(timeoutId);
        console.log('📊 Facebook login status response:', response);
        setFbStatus(response);
        setIsLoading(false);
      });
    } else {
      console.warn('❌ Facebook SDK not available');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Wait for FB SDK to be ready
    if (typeof window !== 'undefined') {
      if (window.FB) {
        checkLoginStatus();
      } else {
        window.fbAsyncInit = function() {
          checkLoginStatus();
        };
      }
    }
  }, []);

  const handleFacebookLogin = async () => {
    console.log('🚀 handleFacebookLogin called');
    
    if (typeof window === 'undefined') {
      console.error('❌ Window is undefined');
      toast({
        variant: "destructive",
        title: "Error",
        description: "Cannot access Facebook SDK."
      });
      return;
    }
    
    if (!window.FB) {
      console.error('❌ Facebook SDK not loaded');
      toast({
        variant: "destructive",
        title: "Facebook SDK Not Available",
        description: "The Facebook SDK failed to load. Please check your internet connection and try refreshing the page.",
      });
      return;
    }

    console.log('✅ Facebook SDK available, initiating login...');
    setIsLoading(true);

    try {
      window.FB.login(async (response: FacebookLoginStatus) => {
        console.log('📬 Facebook login callback received:', response);
        
        if (response.status === 'connected' && response.authResponse?.accessToken) {
          setFbStatus(response);
          const accessToken = response.authResponse.accessToken;
          setUserAccessToken(accessToken);
          
          try {
            console.log('📄 Fetching managed pages...');
            const pagesResponse = await fetch(
              `https://graph.facebook.com/v17.0/me/accounts?access_token=${accessToken}`
            );
            
            if (!pagesResponse.ok) {
              throw new Error('Failed to fetch Facebook pages');
            }
            
            const pagesData = await pagesResponse.json();
            console.log('📋 Pages fetched:', pagesData);
            
            if (pagesData.data && pagesData.data.length > 0) {
              setAvailablePages(pagesData.data);
              setShowPageSelector(true);
              setIsLoading(false);
            } else {
              toast({
                variant: "destructive",
                title: "No Pages Found",
                description: "You don't manage any Facebook Pages. Please create or get access to a Page first."
              });
              setIsLoading(false);
            }
          } catch (error) {
            console.error('💥 Error fetching pages:', error);
            toast({
              variant: "destructive",
              title: "Error",
              description: "Could not fetch your Facebook Pages."
            });
            setIsLoading(false);
          }
        } else if (response.status === 'not_authorized') {
          console.log('❌ User not authorized');
          toast({
            variant: "destructive",
            title: "Authorization Required",
            description: "Please authorize the app to manage your Facebook Pages."
          });
          setIsLoading(false);
        } else {
          console.log('❌ Login cancelled or failed:', response);
          toast({
            variant: "destructive",
            title: "Login Cancelled",
            description: "Facebook login was cancelled. Please ensure pop-ups are allowed and try again."
          });
          setIsLoading(false);
        }
      }, { 
        scope: 'pages_show_list,pages_manage_metadata,pages_messaging,pages_read_engagement,pages_manage_engagement',
        display: 'popup'
      } as any);
    } catch (error) {
      console.error('💥 Exception during Facebook login:', error);
      toast({
        variant: "destructive",
        title: "Connection Error",
        description: "An error occurred while connecting to Facebook. Please try again."
      });
      setIsLoading(false);
    }
  };

  const handlePageSelection = async (selectedPageIds: string[]) => {
    if (selectedPageIds.length === 0 || !userAccessToken) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select at least one page."
      });
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('Exchanging token for selected pages...');
      
      // Exchange token with our backend
      const { error } = await supabase.functions.invoke('facebook-token-exchange', {
        body: { 
          userAccessToken,
          selectedPageIds
        }
      });
      
      if (error) {
        console.error('Error exchanging token:', error);
        toast({
          variant: "destructive",
          title: "Connection Error",
          description: "Could not complete Facebook connection."
        });
        setIsLoading(false);
        return;
      }
      
      toast({
        title: "Facebook Connected",
        description: `Successfully connected ${selectedPageIds.length} Facebook Page${selectedPageIds.length > 1 ? 's' : ''}!`,
      });
      
      setShowPageSelector(false);
      
      // Reload to refresh conversations
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error('Error processing page selection:', error);
      toast({
        variant: "destructive",
        title: "Connection Failed",
        description: "Could not connect to Facebook."
      });
      setIsLoading(false);
    }
  };

  const handleFacebookLogout = async () => {
    if (typeof window !== 'undefined' && window.FB) {
      window.FB.logout(async (response) => {
        setFbStatus(null);
        
        try {
          // Use the custom RPC to update social connection status
          const { error } = await supabase.rpc('update_social_connection_status', {
            platform_name: 'facebook',
            new_status: 'disconnected'
          });
            
          if (error) {
            console.error('Error disconnecting Facebook:', error);
          }
        } catch (error) {
          console.error('Error processing Facebook logout:', error);
        }
        
        toast({
          title: "Logged Out",
          description: "Disconnected from Facebook."
        });
      });
    }
  };

  return {
    fbStatus,
    isLoading,
    handleFacebookLogin,
    handleFacebookLogout,
    availablePages,
    showPageSelector,
    setShowPageSelector,
    handlePageSelection
  };
};
