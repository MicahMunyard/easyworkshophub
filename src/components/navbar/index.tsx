
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
    <header className="sticky top-0 z-30 w-full bg-black">
      <div className="container h-16 border-b border-white/10 flex items-center">
        {/* Logo and Navigation - Left Aligned */}
        <div className="flex items-center gap-6">
          <NavLogo />
          <div className="hidden md:block">
            <NavTabs 
              currentTab={currentTab} 
              onTabChange={handleTabChange} 
              sections={mainNavSections} 
            />
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

        {/* Desktop Navigation Actions - Right Aligned */}
        <NavActions />

        {/* Mobile Toggle and Mode Switch */}
        <div className="flex items-center gap-2 lg:hidden ml-auto">
          <ModeToggle />
          <MobileMenuButton toggleMenu={toggleMenu} />
        </div>
      </div>
    </header>
  );
};

export default Navbar;
