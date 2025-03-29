
import React from "react";
import { Link } from "react-router-dom";
import NavTabs from "./NavTabs";
import NavActions from "./NavActions";
import MobileCloseButton from "./MobileCloseButton";

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
        <MobileCloseButton toggleMenu={toggleMenu} />
      </div>

      <div className="mt-4">
        <NavTabs 
          currentTab={currentTab} 
          onTabChange={onTabChange} 
          sections={sections} 
          isMobile={true}
        />
      </div>

      <div className="mt-auto">
        <NavActions isMobile={true} />
      </div>
    </nav>
  );
};

export default MobileNav;
