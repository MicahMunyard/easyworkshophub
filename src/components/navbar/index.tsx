
import React from "react";
import { useNavigate } from "react-router-dom";
import { Menu } from "lucide-react";
import { useMobileMenu } from "@/hooks/use-mobile-menu";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { cn } from "@/lib/utils";
import NavLogo from "./NavLogo";
import NavTabs from "./NavTabs";
import NavProfile from "./NavProfile";
import MobileNav from "./MobileNav";

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
  const navigate = useNavigate();

  // Determine the current active tab based on path
  const getCurrentTab = () => {
    if (currentPath === '/') return 'dashboard';
    if (currentPath === '/workshop' || currentPath.includes('/booking-diary') || currentPath.includes('/jobs') || currentPath.includes('/workshop-setup')) return 'workshop';
    if (currentPath.includes('/email-integration')) return 'email';
    if (currentPath.includes('/inventory') || currentPath.includes('/suppliers')) return 'inventory';
    if (currentPath.includes('/customers')) return 'customers';
    if (currentPath.includes('/marketing') || currentPath.includes('/email-marketing') || currentPath.includes('/reviews')) return 'marketing';
    if (currentPath.includes('/reports')) return 'reports';
    return 'dashboard';
  };

  // Handle tab change
  const handleTabChange = (value: string) => {
    const section = mainNavSections.find(section => section.name.toLowerCase() === value);
    if (section) {
      onNavigate(section.path);
    }
  };

  const currentTab = getCurrentTab();

  return (
    <header className="sticky top-0 z-30 w-full bg-black">
      <div className="container h-16 border-b border-white/10 flex items-center justify-between">
        {/* Logo Center */}
        <div className="absolute left-1/2 transform -translate-x-1/2">
          <NavLogo />
        </div>

        {/* Navigation Tabs - Left Aligned */}
        <div className="flex items-center">
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
        <div 
          className={cn(
            "hidden lg:flex lg:items-center lg:gap-4 ml-auto"
          )}
        >
          <NavProfile />
          <ModeToggle />
        </div>

        {/* Mobile Toggle and Mode Switch */}
        <div className="flex items-center gap-2 lg:hidden ml-auto">
          <ModeToggle />
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMenu}
            className="lg:hidden text-white hover:bg-white/10"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
