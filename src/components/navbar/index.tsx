
import React from "react";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { useMobileMenu } from "@/hooks/use-mobile-menu";
import NavLogo from "./NavLogo";
import NavTabs from "./NavTabs";
import NavActions from "./NavActions";
import MobileNav from "./MobileNav";
import MobileMenuButton from "./MobileMenuButton";
import { getCurrentTabFromPath } from "./utils/pathUtils";

interface NavbarProps {
  mainNavSections: { name: string; path: string }[];
  currentPath: string;
  onNavigate: (path: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ 
  mainNavSections, 
  currentPath, 
  onNavigate 
}) => {
  const { isOpen, toggleMenu } = useMobileMenu();
  
  // Get current tab based on path
  const currentTab = getCurrentTabFromPath(currentPath);

  // Handle tab change
  const handleTabChange = (value: string) => {
    const section = mainNavSections.find(section => section.name.toLowerCase() === value);
    if (section) {
      onNavigate(section.path);
    }
  };

  return (
    <header className="fixed top-0 left-0 z-30 h-full bg-black">
      <div className="h-full w-64 border-r border-white/10 flex flex-col">
        {/* Logo */}
        <div className="px-4 py-4">
          <NavLogo />
        </div>

        {/* Navigation */}
        <div className="mt-8 flex-1">
          <NavTabs 
            currentTab={currentTab} 
            onTabChange={handleTabChange} 
            sections={mainNavSections} 
            isSidebar={true}
          />
        </div>

        {/* Actions at bottom */}
        <div className="mt-auto p-4">
          <NavActions isSidebar={true} />
        </div>
      </div>

      {/* Mobile Navigation */}
      <MobileNav 
        isOpen={isOpen} 
        toggleMenu={toggleMenu} 
        currentTab={currentTab}
        onTabChange={handleTabChange}
        sections={mainNavSections}
      />

      {/* Mobile Menu Toggle */}
      <div className="fixed top-4 right-4 lg:hidden">
        <MobileMenuButton toggleMenu={toggleMenu} />
      </div>
    </header>
  );
};

export default Navbar;
