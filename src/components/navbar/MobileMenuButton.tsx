
import React from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MobileMenuButtonProps {
  toggleMenu: () => void;
}

const MobileMenuButton: React.FC<MobileMenuButtonProps> = ({ toggleMenu }) => {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleMenu}
      className="lg:hidden text-white hover:bg-white/10"
    >
      <Menu className="h-6 w-6" />
    </Button>
  );
};

export default MobileMenuButton;
