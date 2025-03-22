
import React from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface CleanupButtonProps {
  onClick: () => void;
}

const CleanupButton: React.FC<CleanupButtonProps> = ({ onClick }) => {
  return (
    <Button 
      variant="destructive" 
      size="sm"
      onClick={onClick}
      className="gap-2"
    >
      <Trash2 className="h-4 w-4" />
      Clear My Data
    </Button>
  );
};

export default CleanupButton;
