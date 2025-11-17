
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

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

interface UseFacebookAuthProps {
  onNoPages?: (userAccessToken: string) => void;
}

export const useFacebookAuth = (props?: UseFacebookAuthProps) => {
  const { onNoPages } = props || {};
  const [fbStatus, setFbStatus] = useState<FacebookLoginStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [availablePages, setAvailablePages] = useState<FacebookPage[]>([]);
  const [showPageSelector, setShowPageSelector] = useState(false);
  const [userAccessToken, setUserAccessToken] = useState<string>('');
  const { toast } = useToast();
  const { user } = useAuth();

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
      window.FB.login((response: FacebookLoginStatus) => {
        console.log('📬 Facebook login response:', response);
        console.log('🔑 Granted scopes:', (response.authResponse as any)?.grantedScopes);
        
        if (response.status === 'connected' && response.authResponse?.accessToken) {
          const accessToken = response.authResponse.accessToken;
          setFbStatus(response);
          setUserAccessToken(accessToken);
          
          // Verify permissions
          (window.FB as any).api('/me/permissions', (permissionsResponse: any) => {
            console.log('📋 Permissions response:', permissionsResponse);
            
            const hasPagesList = permissionsResponse?.data?.some(
              (p: any) => p.permission === 'pages_show_list' && p.status === 'granted'
            );

            if (!hasPagesList) {
              toast({
                variant: "destructive",
                title: "Permission Required",
                description: "Please accept the Pages permission to continue."
              });
              setIsLoading(false);
              return;
            }

            // Fetch pages with detailed fields
            (window.FB as any).api(
              '/me/accounts',
              { 
                access_token: accessToken,
                fields: 'id,name,access_token,tasks'
              },
              (pagesResponse: any) => {
                console.log('📄 Pages response:', pagesResponse);

                if (pagesResponse?.error) {
                  console.error('❌ Graph API error:', pagesResponse.error);
                  toast({
                    variant: "destructive",
                    title: "Error Fetching Pages",
                    description: pagesResponse.error.message || "Could not fetch your Facebook pages."
                  });
                  setIsLoading(false);
                  return;
                }

                if (pagesResponse?.data && pagesResponse.data.length > 0) {
                  console.log(`✅ Found ${pagesResponse.data.length} pages`);
                  setAvailablePages(pagesResponse.data);
                  
                  // Auto-connect if only one page
                  if (pagesResponse.data.length === 1) {
                    console.log('🔄 Auto-connecting single page:', pagesResponse.data[0].name);
                    toast({
                      title: "Connecting Facebook Page",
                      description: `Connecting ${pagesResponse.data[0].name}...`
                    });
                    
                    // Automatically select and connect the single page
                    const singlePageId = pagesResponse.data[0].id;
                    handlePageSelection([singlePageId]);
                  } else {
                    // Show selector for multiple pages
                    setShowPageSelector(true);
                    toast({
                      title: "Facebook Connected",
                      description: "Please select the pages you want to connect."
                    });
                    setIsLoading(false);
                  }
                } else {
                  console.warn('⚠️ No pages found, triggering manual connection');
                  setAvailablePages([]);
                  setIsLoading(false);
                  
                  // Trigger manual connection directly
                  if (onNoPages) {
                    onNoPages(accessToken);
                  }
                }
              }
            );
          });
        } else {
          console.log('❌ Login cancelled or failed');
          toast({
            variant: "destructive",
            title: "Login Cancelled",
            description: "Facebook login was cancelled. Please try again."
          });
          setIsLoading(false);
        }
      }, { 
        scope: 'pages_show_list,pages_manage_metadata,pages_messaging,pages_read_engagement,pages_manage_engagement',
        return_scopes: true,
        auth_type: 'rerequest',
        display: 'popup'
      } as any);
    } catch (error) {
      console.error('💥 Exception during Facebook login:', error);
      toast({
        variant: "destructive",
        title: "Connection Error",
        description: error instanceof Error ? error.message : "An error occurred while connecting to Facebook."
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
      console.log('Exchanging token for selected pages:', selectedPageIds);
      
      // Get current session for auth
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }
      
      console.log('Calling token-exchange edge function...');
      
      // Exchange token with our backend
      const { data, error } = await supabase.functions.invoke('facebook-token-exchange', {
        body: { 
          userAccessToken,
          selectedPageIds
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });
      
      console.log('Token exchange response:', { data, error });
      
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
    if (!user?.id) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No user found. Please refresh the page."
      });
      return;
    }

    console.log('🚪 Starting Facebook logout...');
    setIsLoading(true);

    try {
      // Attempt Facebook SDK logout with timeout
      const logoutPromise = new Promise<void>((resolve) => {
        if (window.FB) {
          const timeoutId = setTimeout(() => {
            console.warn('⏱️ Facebook SDK logout timed out');
            resolve();
          }, 5000);

          window.FB.logout((response: any) => {
            clearTimeout(timeoutId);
            console.log('📤 Facebook SDK logout response:', response);
            resolve();
          });
        } else {
          console.warn('⚠️ Facebook SDK not available, proceeding with DB cleanup only');
          resolve();
        }
      });

      await logoutPromise;

      // Always perform database cleanup
      console.log('🗑️ Cleaning up database records...');
      
      const { error: connectionError } = await supabase
        .from('social_connections')
        .delete()
        .eq('platform', 'facebook')
        .eq('user_id', user.id);

      if (connectionError) {
        console.error('❌ Error deleting social connection:', connectionError);
        throw new Error(`Database cleanup failed: ${connectionError.message}`);
      }

      const { error: tokenError } = await supabase
        .from('facebook_page_tokens')
        .delete()
        .eq('user_id', user.id);

      if (tokenError) {
        console.error('❌ Error deleting page tokens:', tokenError);
        throw new Error(`Database cleanup failed: ${tokenError.message}`);
      }

      console.log('✅ Successfully disconnected from Facebook');
      setFbStatus(null);
      
      toast({
        title: "Disconnected",
        description: "Successfully disconnected from Facebook."
      });

      // Reload to refresh UI state
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('💥 Error during logout:', error);
      toast({
        variant: "destructive",
        title: "Disconnect Error",
        description: error instanceof Error ? error.message : "Could not disconnect from Facebook."
      });
      setIsLoading(false);
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
