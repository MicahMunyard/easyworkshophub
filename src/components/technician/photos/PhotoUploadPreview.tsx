
import React from "react";
import { X, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PhotoUploadPreviewProps {
  previewImage: string;
  isUploading: boolean;
  onCancelUpload: () => void;
  onUpload: () => void;
}

const PhotoUploadPreview: React.FC<PhotoUploadPreviewProps> = ({
  previewImage,
  isUploading,
  onCancelUpload,
  onUpload
}) => {
  return (
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
          onClick={onCancelUpload}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <Button 
        className="w-full gap-2"
        onClick={onUpload}
        disabled={isUploading}
      >
        <Upload className="h-4 w-4" />
        {isUploading ? 'Uploading...' : 'Upload Photo'}
      </Button>
    </div>
  );
};

export default PhotoUploadPreview;
