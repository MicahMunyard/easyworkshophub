
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

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

  const handleFacebookLogin = () => {
    if (typeof window !== 'undefined' && window.FB) {
      window.FB.login((response: FacebookLoginStatus) => {
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
    if (typeof window !== 'undefined' && window.FB) {
      window.FB.logout((response) => {
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

