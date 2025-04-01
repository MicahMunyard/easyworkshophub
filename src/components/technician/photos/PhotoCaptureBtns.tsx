
import React from "react";
import { Camera, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PhotoCaptureButtonsProps {
  onTakePhoto: () => void;
  onUploadImage: () => void;
}

const PhotoCaptureButtons: React.FC<PhotoCaptureButtonsProps> = ({
  onTakePhoto,
  onUploadImage
}) => {
  return (
    <div className="flex gap-4">
      <Button 
        variant="outline" 
        className="w-full gap-2"
        onClick={onTakePhoto}
      >
        <Camera className="h-4 w-4" />
        Take Photo
      </Button>
      <Button 
        variant="outline" 
        className="w-full gap-2"
        onClick={onUploadImage}
      >
        <Upload className="h-4 w-4" />
        Upload Image
      </Button>
    </div>
  );
};

export default PhotoCaptureButtons;
