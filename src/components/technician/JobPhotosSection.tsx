
import React, { useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Upload, X } from "lucide-react";
import { JobPhoto } from "@/types/technician";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

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
  
  const handlePhotoClick = (photo: JobPhoto) => {
    setSelectedPhoto(photo);
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
              <div className="border rounded-md p-3 space-y-3">
                <div className="relative">
                  <img 
                    src={previewImage} 
                    alt="Preview" 
                    className="w-full rounded-md object-cover max-h-60"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8"
                    onClick={() => setPreviewImage(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <Button 
                  className="w-full gap-2"
                  onClick={handleUpload}
                  disabled={isUploading}
                >
                  <Upload className="h-4 w-4" />
                  {isUploading ? 'Uploading...' : 'Upload Photo'}
                </Button>
              </div>
            )}
            
            {photos.length > 0 && (
              <div className="grid grid-cols-2 gap-4">
                {photos.map(photo => (
                  <div 
                    key={photo.id} 
                    className="border rounded-md overflow-hidden cursor-pointer"
                    onClick={() => handlePhotoClick(photo)}
                  >
                    <img 
                      src={photo.url} 
                      alt={photo.caption || 'Job photo'} 
                      className="w-full h-40 object-cover"
                    />
                    <div className="p-2">
                      <p className="text-xs truncate text-muted-foreground">
                        {new Date(photo.uploaded_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
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
              <div className="flex gap-4">
                <Button 
                  variant="outline" 
                  className="w-full gap-2"
                  onClick={handleCapture}
                >
                  <Camera className="h-4 w-4" />
                  Take Photo
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full gap-2"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4" />
                  Upload Image
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Photo Detail Dialog */}
      <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
        <DialogContent className="max-w-[90vw] sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Photo Details</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {selectedPhoto && (
              <>
                <img 
                  src={selectedPhoto.url} 
                  alt={selectedPhoto.caption || 'Job photo'} 
                  className="w-full rounded-md object-contain max-h-[60vh]"
                />
                <div className="mt-4 space-y-2">
                  <p className="text-sm font-medium">
                    Uploaded: {new Date(selectedPhoto.uploaded_at).toLocaleString()}
                  </p>
                  {selectedPhoto.caption && (
                    <p className="text-sm">{selectedPhoto.caption}</p>
                  )}
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default JobPhotosSection;
