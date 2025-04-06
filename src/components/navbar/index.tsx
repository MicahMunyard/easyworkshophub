
import React from "react";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { useMobileMenu } from "@/hooks/use-mobile-menu";
import NavLogo from "./NavLogo";
import NavTabs from "./NavTabs";
import NavActions from "./NavActions";
import MobileNav from "./MobileNav";
import MobileMenuButton from "./MobileMenuButton";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useIsMobile } from "@/hooks/use-mobile";

interface NavbarProps {
  secondaryNavSections: { name: string; path: string }[];
  currentPath: string;
  onNavigate: (path: string) => void;
  onMenuToggle?: () => void; // New prop for sidebar toggle
}

const Navbar: React.FC<NavbarProps> = ({ 
  secondaryNavSections, 
  currentPath, 
  onNavigate,
  onMenuToggle 
}) => {
  const { isOpen, toggleMenu } = useMobileMenu();
  const isMobile = useIsMobile();
  
  // Get current tab based on path
  const getCurrentTab = (path: string, sections: { name: string; path: string }[]): string => {
    const section = sections.find(section => section.path === path);
    return section ? section.name.toLowerCase() : "";
  };

  const currentTab = getCurrentTab(currentPath, secondaryNavSections);

  // Handle tab change
  const handleTabChange = (value: string) => {
    const section = secondaryNavSections.find(section => section.name.toLowerCase() === value);
    if (section) {
      onNavigate(section.path);
    }
  };

  // Handle the menu button click, either toggling mobile menu or sidebar
  const handleMenuClick = () => {
    if (onMenuToggle) {
      onMenuToggle();
    } else {
      toggleMenu();
    }
  };

  return (
    <>
      {/* Top Navigation Bar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black h-16 border-b border-white/10 ml-16">
        <div className="h-full px-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            {/* Logo */}
            <NavLogo />

            {/* Navigation Tabs - Secondary Navigation */}
            <div className="hidden lg:block">
              {secondaryNavSections.length > 0 && (
                <NavTabs 
                  currentTab={currentTab} 
                  onTabChange={handleTabChange} 
                  sections={secondaryNavSections} 
                  isTopNav={true}
                />
              )}
            </div>
          </div>

          {/* Right Side - Search and Actions */}
          <div className="flex items-center gap-4">
            {/* Search Bar */}
            <div className="relative hidden md:flex items-center">
              <Input 
                type="search" 
                placeholder="Search..." 
                className="w-[200px] lg:w-[300px] pl-9 bg-black/50 border border-white/20 text-white"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
            </div>

            {/* User Actions */}
            <NavActions />
          </div>
        </div>

        {/* Mobile Menu Toggle */}
        <div className="absolute top-4 right-4 lg:hidden">
          <MobileMenuButton toggleMenu={handleMenuClick} />
        </div>
      </header>

      {/* Mobile Navigation */}
      <MobileNav 
        isOpen={isOpen} 
        toggleMenu={toggleMenu} 
        currentTab={currentTab}
        onTabChange={handleTabChange}
        sections={secondaryNavSections}
      />
    </>
  );
};

export default Navbar;
