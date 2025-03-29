
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
    <nav className="fixed inset-0 bg-black p-6 flex flex-col gap-8 z-50 translate-x-0 transition-transform duration-300">
      <div className="flex items-center justify-between">
        <Link to="/" className="flex items-center justify-center w-full">
          <img
            src="/lovable-uploads/f43be453-735e-4166-99a5-8800aff53fdd.png"
            alt="BASE Logo"
            className="h-8 w-auto"
            width={100}
            height={32}
          />
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleMenu}
          className="text-white hover:bg-white/10 absolute right-4 top-4"
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
