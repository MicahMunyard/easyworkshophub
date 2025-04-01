
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { JobPhoto } from "@/types/technician";

interface PhotoDetailDialogProps {
  selectedPhoto: JobPhoto | null;
  onOpenChange: (open: boolean) => void;
}

const PhotoDetailDialog: React.FC<PhotoDetailDialogProps> = ({
  selectedPhoto,
  onOpenChange
}) => {
  return (
    <Dialog open={!!selectedPhoto} onOpenChange={onOpenChange}>
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
  );
};

export default PhotoDetailDialog;
