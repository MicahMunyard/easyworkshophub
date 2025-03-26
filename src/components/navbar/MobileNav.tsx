
import React from "react";
import { X } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import NavTabs from "./NavTabs";
import NavProfile from "./NavProfile";
import { ModeToggle } from "@/components/ui/mode-toggle";

interface MobileNavProps {
  isOpen: boolean;
  toggleMenu: () => void;
  currentTab: string;
  onTabChange: (value: string) => void;
  sections: { name: string; path: string }[];
}

const MobileNav: React.FC<MobileNavProps> = ({
  isOpen,
  toggleMenu,
  currentTab,
  onTabChange,
  sections
}) => {
  if (!isOpen) return null;

  return (
    <nav className="fixed inset-0 bg-background p-6 flex flex-col gap-8 z-50 translate-x-0 transition-transform duration-300">
      <div className="flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img
            src="/lovable-uploads/toliccs-logo.png"
            alt="Toliccs Logo"
            className="w-8 h-8"
            width={32}
            height={32}
          />
          <span className="font-bold text-xl">Toliccs</span>
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleMenu}
        >
          <X className="h-6 w-6" />
        </Button>
      </div>

      <div className="mt-4">
        <NavTabs 
          currentTab={currentTab} 
          onTabChange={onTabChange} 
          sections={sections} 
          isMobile={true}
        />
      </div>

      <div className="mt-auto flex flex-col items-center gap-4">
        <NavProfile />
        <ModeToggle />
      </div>
    </nav>
  );
};

export default MobileNav;
