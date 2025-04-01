
import React from "react";
import { JobPhoto } from "@/types/technician";

interface PhotoGridProps {
  photos: JobPhoto[];
  onPhotoClick: (photo: JobPhoto) => void;
}

const PhotoGrid: React.FC<PhotoGridProps> = ({ photos, onPhotoClick }) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      {photos.map(photo => (
        <div 
          key={photo.id} 
          className="border rounded-md overflow-hidden cursor-pointer"
          onClick={() => onPhotoClick(photo)}
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
  );
};

export default PhotoGrid;
