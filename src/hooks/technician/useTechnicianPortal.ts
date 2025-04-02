
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { TechnicianProfile } from "@/types/technician";
import { useToast } from "@/hooks/use-toast";

export const useTechnicianPortal = () => {
  const [isOffline, setIsOffline] = useState(false);
  const [isTechnicianAuthenticated, setIsTechnicianAuthenticated] = useState(false);
  const [technicianProfile, setTechnicianProfile] = useState<TechnicianProfile | null>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    // Check technician authentication
    const storedTechnicianProfile = localStorage.getItem('technicianProfile');
    if (storedTechnicianProfile) {
      try {
        const parsedProfile = JSON.parse(storedTechnicianProfile);
        setTechnicianProfile(parsedProfile);
        setIsTechnicianAuthenticated(true);
      } catch (e) {
        console.error('Error parsing technician profile:', e);
        localStorage.removeItem('technicianProfile');
      }
    }
    
    // Check internet connectivity
    const checkConnectivity = () => {
      setIsOffline(!navigator.onLine);
    };
    
    window.addEventListener('online', checkConnectivity);
    window.addEventListener('offline', checkConnectivity);
    checkConnectivity();
    
    return () => {
      window.removeEventListener('online', checkConnectivity);
      window.removeEventListener('offline', checkConnectivity);
    };
  }, []);
  
  const logout = () => {
    localStorage.removeItem('technicianProfile');
    setTechnicianProfile(null);
    setIsTechnicianAuthenticated(false);
    window.location.reload();
  };
  
  return {
    isOffline,
    isTechnicianAuthenticated,
    technicianProfile,
    logout
  };
};
