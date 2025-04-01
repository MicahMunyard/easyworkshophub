
import React, { useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { JobPhoto } from "@/types/technician";
import { useToast } from "@/hooks/use-toast";
import PhotoUploadPreview from "./PhotoUploadPreview";
import PhotoGrid from "./PhotoGrid";
import PhotoDetailDialog from "./PhotoDetailDialog";
import PhotoCaptureButtons from "./PhotoCaptureBtns";

interface JobPhotosSectionProps {
  jobId: string;
  photos: JobPhoto[];
  onUploadPhoto: (jobId: string, file: File) => void;
}

const JobPhotosSection: React.FC<JobPhotosSectionProps> = ({
  jobId,
  photos,
  onUploadPhoto
}) => {
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<JobPhoto | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file.",
        variant: "destructive"
      });
      return;
    }
    
    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB.",
        variant: "destructive"
      });
      return;
    }
    
    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };
  
  const handleCapture = () => {
    // Trigger file input click to open camera on mobile
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleUpload = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    
    try {
      await onUploadPhoto(jobId, file);
      setPreviewImage(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
    } finally {
      setIsUploading(false);
    }
  };
  
  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Job Photos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {photos.length === 0 && !previewImage && (
              <div className="text-center py-8 text-muted-foreground">
                No photos for this job yet
              </div>
            )}
            
            {previewImage && (
              <PhotoUploadPreview
                previewImage={previewImage}
                isUploading={isUploading}
                onCancelUpload={() => setPreviewImage(null)}
                onUpload={handleUpload}
              />
            )}
            
            {photos.length > 0 && (
              <PhotoGrid 
                photos={photos} 
                onPhotoClick={setSelectedPhoto} 
              />
            )}
            
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleFileSelect}
              capture="environment"
            />
            
            {!previewImage && (
              <PhotoCaptureButtons
                onTakePhoto={handleCapture}
                onUploadImage={() => fileInputRef.current?.click()}
              />
            )}
          </div>
        </CardContent>
      </Card>
      
      <PhotoDetailDialog
        selectedPhoto={selectedPhoto}
        onOpenChange={() => setSelectedPhoto(null)}
      />
    </>
  );
};

export default JobPhotosSection;
