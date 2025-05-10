
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
  const { user } = useAuth();
  const [workshop, setWorkshop] = useState<Workshop | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // In a real app, we would fetch the workshop details from the database
    // For now, we'll simulate it based on the user information
    if (user) {
      setWorkshop({
        id: user.id,
        name: user.name || 'Workshop',
        email: user.email,
      });
    } else {
      setWorkshop(null);
    }
    setIsLoading(false);
  }, [user]);
  
  return {
    workshop,
    isLoading,
  };
}
