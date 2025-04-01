
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { TechnicianProfile } from "@/types/technician";
import { useToast } from "@/hooks/use-toast";

export const useTechnicianPortal = () => {
  const [isTechnicianAuthenticated, setIsTechnicianAuthenticated] = useState<boolean>(false);
  const [technicianProfile, setTechnicianProfile] = useState<TechnicianProfile | null>(null);
  const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine);
  const { user } = useAuth();
  const { toast } = useToast();

  // Check network status
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => {
      setIsOffline(true);
      toast({
        title: "You're offline",
        description: "Data will be synced when you reconnect.",
        variant: "destructive"
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [toast]);

  // Check if current user is a technician
  useEffect(() => {
    const checkTechnicianStatus = async () => {
      if (!user) return;

      try {
        // Check if the user has an associated technician profile
        const { data, error } = await supabase
          .from('user_technicians')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Error fetching technician profile:', error);
          return;
        }

        if (data) {
          setIsTechnicianAuthenticated(true);
          setTechnicianProfile({
            id: data.id,
            name: data.name,
            specialty: data.specialty || null,
            experience: data.experience || null,
            user_id: data.user_id,
            created_at: data.created_at,
            updated_at: data.updated_at
          });
        }
      } catch (error) {
        console.error('Error in technician authentication check:', error);
      }
    };

    checkTechnicianStatus();
  }, [user]);

  return {
    isTechnicianAuthenticated,
    technicianProfile,
    isOffline
  };
};
