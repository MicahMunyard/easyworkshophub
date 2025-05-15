
import { useState, useEffect } from 'react';

interface Workshop {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  logo?: string;
}

export function useWorkshop() {
  const [workshop, setWorkshop] = useState<Workshop | null>({
    name: 'My Workshop',
    email: 'contact@myworkshop.com',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // In a real app, this would fetch workshop data from the database
    // For now, we'll just use a mock
    const fetchWorkshop = async () => {
      try {
        // Mock data
        setWorkshop({
          name: 'My Workshop',
          email: 'contact@myworkshop.com',
          phone: '555-123-4567',
          address: '123 Workshop St, Repair City, TX',
          logo: '/lovable-uploads/toliccs-logo.png',
        });
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load workshop data'));
      } finally {
        setLoading(false);
      }
    };

    fetchWorkshop();
  }, []);

  return { workshop, loading, error };
}
