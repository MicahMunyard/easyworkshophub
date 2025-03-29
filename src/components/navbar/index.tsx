
import React from "react";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { useMobileMenu } from "@/hooks/use-mobile-menu";
import NavLogo from "./NavLogo";
import NavTabs from "./NavTabs";
import NavActions from "./NavActions";
import MobileNav from "./MobileNav";
import MobileMenuButton from "./MobileMenuButton";
import { getCurrentTabFromPath } from "./utils/pathUtils";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

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
    <>
      {/* Top Navigation Bar */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-black h-16 border-b border-white/10">
        <div className="h-full px-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            {/* Logo */}
            <NavLogo />

            {/* Navigation Tabs */}
            <div className="hidden lg:block">
              <NavTabs 
                currentTab={currentTab} 
                onTabChange={handleTabChange} 
                sections={mainNavSections} 
                isTopNav={true}
              />
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
          <MobileMenuButton toggleMenu={toggleMenu} />
        </div>
      </header>

      {/* Left Sidebar */}
      <aside className="fixed top-16 left-0 z-30 h-[calc(100vh-4rem)] bg-black w-64 border-r border-white/10 hidden lg:block">
        <div className="h-full w-full flex flex-col py-4">
          {/* Sidebar Navigation based on current tab */}
          <div className="flex-1 px-2">
            {currentTab === 'workshop' && (
              <SidebarSection 
                title="Workshop" 
                items={[
                  { name: "Booking Diary", path: "/booking-diary" },
                  { name: "Jobs", path: "/jobs" },
                  { name: "Workshop Setup", path: "/workshop-setup" }
                ]}
                currentPath={currentPath}
                onNavigate={onNavigate}
              />
            )}
            {currentTab === 'inventory' && (
              <SidebarSection 
                title="Inventory" 
                items={[
                  { name: "Inventory", path: "/inventory" },
                  { name: "Suppliers", path: "/suppliers" }
                ]}
                currentPath={currentPath}
                onNavigate={onNavigate}
              />
            )}
            {currentTab === 'email' && (
              <SidebarSection 
                title="Email" 
                items={[
                  { name: "Email Integration", path: "/email-integration" }
                ]}
                currentPath={currentPath}
                onNavigate={onNavigate}
              />
            )}
            {currentTab === 'customers' && (
              <SidebarSection 
                title="Customers" 
                items={[
                  { name: "Customers", path: "/customers" }
                ]}
                currentPath={currentPath}
                onNavigate={onNavigate}
              />
            )}
            {currentTab === 'marketing' && (
              <SidebarSection 
                title="Marketing" 
                items={[
                  { name: "Marketing", path: "/marketing" },
                  { name: "Email Marketing", path: "/email-marketing" },
                  { name: "Reviews", path: "/reviews" }
                ]}
                currentPath={currentPath}
                onNavigate={onNavigate}
              />
            )}
          </div>
        </div>
      </aside>

      {/* Mobile Navigation */}
      <MobileNav 
        isOpen={isOpen} 
        toggleMenu={toggleMenu} 
        currentTab={currentTab}
        onTabChange={handleTabChange}
        sections={mainNavSections}
      />
    </>
  );
};

// Sidebar Section Component
const SidebarSection: React.FC<{
  title: string;
  items: { name: string; path: string }[];
  currentPath: string;
  onNavigate: (path: string) => void;
}> = ({ title, items, currentPath, onNavigate }) => {
  return (
    <div className="space-y-2">
      <h3 className="text-white/60 font-medium px-4 py-2 text-sm">{title}</h3>
      <div className="space-y-1">
        {items.map((item) => (
          <button
            key={item.name}
            onClick={() => onNavigate(item.path)}
            className={`w-full text-left px-4 py-2 text-white hover:bg-white/10 rounded-md transition-colors ${
              currentPath === item.path ? "bg-white/5 relative" : ""
            }`}
          >
            <span>{item.name}</span>
            {currentPath === item.path && (
              <span className="absolute w-1 left-0 top-0 h-full bg-workshop-red rounded-r" aria-hidden="true" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Navbar;
