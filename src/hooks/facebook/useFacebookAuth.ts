
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

// Define a type for social connections
interface SocialConnection {
  id: string;
  platform: string;
  status: string;
  page_id?: string;
  user_id: string;
}

export const useFacebookAuth = () => {
  const [fbStatus, setFbStatus] = useState<FacebookLoginStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const checkLoginStatus = () => {
    if (typeof window !== 'undefined' && window.FB) {
      window.FB.getLoginStatus((response: FacebookLoginStatus) => {
        console.log('Facebook login status:', response);
        setFbStatus(response);
        setIsLoading(false);
      });
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
    console.log('handleFacebookLogin called');
    
    if (typeof window === 'undefined') {
      console.error('Window is undefined');
      toast({
        variant: "destructive",
        title: "Error",
        description: "Cannot access Facebook SDK."
      });
      return;
    }
    
    if (!window.FB) {
      console.error('Facebook SDK not loaded');
      toast({
        variant: "destructive",
        title: "Facebook SDK Not Loaded",
        description: "Please refresh the page and try again."
      });
      return;
    }
    
    console.log('Initiating Facebook login...');
    
    try {
      window.FB.login(async (response: FacebookLoginStatus) => {
        console.log('Facebook login callback received:', response);
        if (response.status === 'connected') {
          setFbStatus(response);
          
          try {
            // Save the user's access token to Supabase
            const { error } = await supabase.functions.invoke('facebook-token-exchange', {
              body: { 
                userAccessToken: response.authResponse?.accessToken 
              }
            });
            
            if (error) {
              console.error('Error exchanging token:', error);
              toast({
                variant: "destructive",
                title: "Connection Error",
                description: "Could not complete Facebook connection."
              });
              return;
            }
            
            toast({
              title: "Facebook Connected",
              description: "Successfully connected to Facebook. Your page conversations will appear soon.",
            });
            
            // Reload the page after a short delay to refresh conversations
            setTimeout(() => {
              window.location.reload();
            }, 2000);
          } catch (error) {
            console.error('Error processing Facebook login:', error);
            toast({
              variant: "destructive",
              title: "Connection Failed",
              description: "Could not connect to Facebook."
            });
          }
        } else {
          toast({
            variant: "destructive",
            title: "Connection Failed",
            description: "Could not connect to Facebook."
          });
        }
      }, { scope: 'public_profile,pages_messaging,pages_show_list,pages_manage_metadata' });
    } catch (error) {
      console.error('Error in Facebook login:', error);
      toast({
        variant: "destructive",
        title: "Login Error",
        description: "An error occurred during Facebook login."
      });
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
    handleFacebookLogout
  };
};
