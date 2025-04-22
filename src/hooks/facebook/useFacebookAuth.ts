
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface FacebookAuthResponse {
  status: 'connected' | 'not_authorized' | 'unknown';
  authResponse?: {
    accessToken: string;
    expiresIn: string;
    signedRequest: string;
    userID: string;
  };
}

export const useFacebookAuth = () => {
  const [fbStatus, setFbStatus] = useState<FacebookAuthResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const checkLoginStatus = () => {
    if (typeof FB !== 'undefined') {
      FB.getLoginStatus((response: FacebookAuthResponse) => {
        console.log('Facebook login status:', response);
        setFbStatus(response);
        setIsLoading(false);
      });
    }
  };

  useEffect(() => {
    // Wait for FB SDK to be ready
    if (typeof FB !== 'undefined') {
      checkLoginStatus();
    } else {
      window.fbAsyncInit = function() {
        checkLoginStatus();
      };
    }
  }, []);

  const handleFacebookLogin = () => {
    if (typeof FB !== 'undefined') {
      FB.login((response: FacebookAuthResponse) => {
        if (response.status === 'connected') {
          setFbStatus(response);
          toast({
            title: "Facebook Connected",
            description: "Successfully connected to Facebook.",
          });
        } else {
          toast({
            variant: "destructive",
            title: "Connection Failed",
            description: "Could not connect to Facebook."
          });
        }
      }, { scope: 'public_profile,pages_messaging,pages_show_list,pages_manage_metadata' });
    }
  };

  const handleFacebookLogout = () => {
    if (typeof FB !== 'undefined') {
      FB.logout((response) => {
        setFbStatus(null);
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
