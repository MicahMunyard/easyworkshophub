
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface Workshop {
  id?: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  logo?: string;
}

export function useWorkshop() {
  const { user, profile } = useAuth();
  const [workshop, setWorkshop] = useState<Workshop | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // In a real app, we would fetch the workshop details from the database
    // For now, we'll simulate it based on the user and profile information
    if (user) {
      // Get name from profile or user metadata or default
      const workshopName = 
        (profile?.name) || 
        (user.user_metadata?.name) || 
        'Workshop';
      
      setWorkshop({
        id: user.id,
        name: workshopName,
        email: user.email,
      });
    } else {
      setWorkshop(null);
    }
    setIsLoading(false);
  }, [user, profile]);
  
  return {
    workshop,
    isLoading,
  };
}
