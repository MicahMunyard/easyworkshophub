import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the hash fragment from the URL
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const type = hashParams.get('type');

        console.log('Auth callback - type:', type);

        if (!accessToken || !refreshToken) {
          throw new Error('Missing authentication tokens');
        }

        // Set the session using the tokens from the URL
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (error) {
          console.error('Error setting session:', error);
          throw error;
        }

        console.log('Session set successfully:', data);

        // Show success message
        toast({
          title: 'Email confirmed!',
          description: 'Your account has been verified successfully.',
        });

        // Redirect to dashboard
        navigate('/', { replace: true });
      } catch (err: any) {
        console.error('Auth callback error:', err);
        setError(err.message || 'Failed to authenticate');
        
        toast({
          title: 'Authentication failed',
          description: err.message || 'The verification link may have expired. Please try signing in or request a new verification email.',
          variant: 'destructive',
        });

        // Redirect to sign in after a delay
        setTimeout(() => {
          navigate('/auth/signin', { replace: true });
        }, 3000);
      }
    };

    handleAuthCallback();
  }, [navigate]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center space-y-4 p-8 max-w-md">
          <div className="text-destructive text-5xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-foreground">Authentication Error</h1>
          <p className="text-muted-foreground">{error}</p>
          <p className="text-sm text-muted-foreground">Redirecting to sign in page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center space-y-4 p-8">
        <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
        <h1 className="text-2xl font-bold text-foreground">Verifying your account...</h1>
        <p className="text-muted-foreground">Please wait while we confirm your email address.</p>
      </div>
    </div>
  );
};

export default AuthCallback;
