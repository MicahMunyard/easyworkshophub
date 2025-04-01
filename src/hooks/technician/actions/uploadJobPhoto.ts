
import { v4 as uuidv4 } from "uuid";
import { supabase } from "@/integrations/supabase/client";
import { TechnicianJob, JobPhoto } from "@/types/technician";
import { useToast } from "@/hooks/use-toast";
import { createOfflineOperation } from "../utils/offlineUtils";
import { OfflineOperation } from "../types/offlineTypes";

export const useUploadJobPhoto = (
  setJobs: React.Dispatch<React.SetStateAction<TechnicianJob[]>>,
  setOfflineOperations: React.Dispatch<React.SetStateAction<OfflineOperation[]>>
) => {
  const { toast } = useToast();

  const uploadJobPhoto = async (jobId: string, file: File): Promise<void> => {
    if (!navigator.onLine) {
      // Store operation for later sync
      // In a real implementation, we'd save the file locally
      const offlineOp = createOfflineOperation('photo_upload', { jobId, fileName: file.name });
      setOfflineOperations(prev => [...prev, offlineOp]);
      
      toast({
        title: "Photo saved (offline mode)",
        description: "Photo will be uploaded when you're back online.",
      });
      return;
    }
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${jobId}/${Date.now()}.${fileExt}`;
      
      // Upload to Supabase Storage
      const { error } = await supabase.storage
        .from('job_photos')
        .upload(fileName, file);
      
      if (error) throw error;
      
      // Get public URL
      const { data } = supabase.storage
        .from('job_photos')
        .getPublicUrl(fileName);
      
      // Update local state
      setJobs(prev => prev.map(job => {
        if (job.id === jobId) {
          return {
            ...job,
            photos: [...job.photos, {
              id: uuidv4(),
              url: data.publicUrl,
              uploaded_at: new Date().toISOString(),
              caption: "Photo from technician"
            }]
          };
        }
        return job;
      }));
      
      toast({
        title: "Photo uploaded",
        description: "Photo has been added to the job.",
      });
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast({
        title: "Failed to upload photo",
        description: "Please try again.",
        variant: "destructive"
      });
    }
  };

  return uploadJobPhoto;
};
