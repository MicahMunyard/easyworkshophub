
import React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MobileCloseButtonProps {
  toggleMenu: () => void;
}

const MobileCloseButton: React.FC<MobileCloseButtonProps> = ({ toggleMenu }) => {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleMenu}
      className="text-white hover:bg-white/10 absolute right-4 top-4"
    >
      <X className="h-6 w-6" />
    </Button>
  );
};

export default MobileCloseButton;
