
import React, { useState, useEffect } from "react";
import Navbar from "./navbar";
import { useLocation, useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  mainNavSections, 
  secondaryNavSections,
  settingsNavSections 
} from "@/config/navigation";
import {
  LayoutDashboard,
  Calendar,
  FileText,
  Mail,
  MessageSquare,
  Package,
  Users,
  BarChart3,
  Clock,
  FileCode,
  Wrench,
  Settings,
  HelpCircle,
  Megaphone
} from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const isMobile = useIsMobile();
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Icon mapping
  const iconMap: Record<string, React.ReactElement> = {
    LayoutDashboard: <LayoutDashboard className="h-5 w-5" />,
    Calendar: <Calendar className="h-5 w-5" />,
    FileText: <FileText className="h-5 w-5" />,
    Mail: <Mail className="h-5 w-5" />,
    MessageSquare: <MessageSquare className="h-5 w-5" />,
    Package: <Package className="h-5 w-5" />,
    Users: <Users className="h-5 w-5" />,
    BarChart3: <BarChart3 className="h-5 w-5" />,
    Clock: <Clock className="h-5 w-5" />,
    FileCode: <FileCode className="h-5 w-5" />,
    Wrench: <Wrench className="h-5 w-5" />,
    Settings: <Settings className="h-5 w-5" />,
    HelpCircle: <HelpCircle className="h-5 w-5" />,
    Megaphone: <Megaphone className="h-5 w-5" />
  };

  // Always declare ALL hooks before any conditional logic or returns
  useEffect(() => {
    if (isMobile) {
      setSidebarExpanded(false);
    }
  }, [isMobile, location.pathname]);

  const getCurrentMainSection = (path: string): string => {
    if (path === '/' || path === '') return 'dashboard';
    if (path.includes('/booking-diary') || path.includes('/jobs')) return 'bookings';
    if (path.includes('/email-integration')) return 'email';
    if (path.includes('/communication')) return 'communication';
    if (path.includes('/inventory') || path.includes('/suppliers')) return 'inventory';
    if (path.includes('/customers')) return 'customers';
    if (path.includes('/marketing') || path.includes('/email-marketing') || path.includes('/reviews')) return 'marketing';
    if (path.includes('/reports')) return 'reports';
    if (path.includes('/timesheets')) return 'timesheets';
    if (path.includes('/workshop')) return 'workshop';
    if (path.includes('/technician-portal')) return 'technician';
    return 'dashboard';
  };

  const currentMainSection = getCurrentMainSection(location.pathname);
  const currentSecondaryNav = secondaryNavSections[currentMainSection] || [];

  const handleSidebarToggle = () => {
    if (isMobile) {
      setSidebarExpanded(!sidebarExpanded);
    }
  };

  // After ALL hooks have been called, we can safely return conditionally
  if (location.pathname.includes('/technician-portal')) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <aside 
        className={`fixed top-0 left-0 h-full bg-black z-40 transition-all duration-300 ease-in-out pt-16 ${
          sidebarExpanded ? (isMobile ? "w-full" : "w-64") : "w-16"
        } ${isMobile && sidebarExpanded ? "overflow-y-auto" : ""}`}
        onMouseEnter={() => !isMobile && setSidebarExpanded(true)}
        onMouseLeave={() => !isMobile && setSidebarExpanded(false)}
      >
        {isMobile && sidebarExpanded && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-30"
            onClick={handleSidebarToggle}
          />
        )}

        <div className="flex flex-col h-full">
          <div className="flex-1 py-4 overflow-y-auto scrollbar-none">
            {/* Main Navigation Items */}
            {mainNavSections.map((section) => {
              const isActive = section.name.toLowerCase() === currentMainSection;
              return (
                <button
                  key={section.name}
                  onClick={() => {
                    navigate(section.path);
                    if (isMobile) setSidebarExpanded(false);
                  }}
                  className={`flex items-center w-full py-3 px-4 text-white transition-colors hover:bg-white/10 relative ${
                    isActive ? "bg-white/5" : ""
                  }`}
                >
                  <span className="flex items-center justify-center">
                    {iconMap[section.icon]}
                  </span>
                  <span 
                    className={`ml-4 transition-opacity whitespace-nowrap ${
                      sidebarExpanded ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    {section.name}
                  </span>
                  {isActive && (
                    <span 
                      className="absolute w-1 left-0 top-0 h-full bg-workshop-red rounded-r" 
                      aria-hidden="true" 
                    />
                  )}
                </button>
              );
            })}

            {/* Settings Navigation Items */}
            <div className="mt-auto pt-4 border-t border-white/10 mx-4 mb-4"></div>
            {settingsNavSections.map((section) => {
              const isActive = location.pathname === section.path;
              return (
                <button
                  key={section.name}
                  onClick={() => {
                    navigate(section.path);
                    if (isMobile) setSidebarExpanded(false);
                  }}
                  className={`flex items-center w-full py-3 px-4 text-white transition-colors hover:bg-white/10 relative ${
                    isActive ? "bg-white/5" : ""
                  }`}
                >
                  <span className="flex items-center justify-center">
                    {iconMap[section.icon]}
                  </span>
                  <span 
                    className={`ml-4 transition-opacity whitespace-nowrap ${
                      sidebarExpanded ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    {section.name}
                  </span>
                  {isActive && (
                    <span 
                      className="absolute w-1 left-0 top-0 h-full bg-workshop-red rounded-r" 
                      aria-hidden="true" 
                    />
                  )}
                </button>
              );
            })}
          </div>
          {isMobile && sidebarExpanded && (
            <button 
              className="p-4 text-white border-t border-white/10 mt-auto"
              onClick={() => setSidebarExpanded(false)}
            >
              Close Menu
            </button>
          )}
        </div>
      </aside>

      <div className={`flex-1 transition-all duration-300 ${sidebarExpanded && !isMobile ? "ml-64" : "ml-16"}`}>
        <Navbar 
          secondaryNavSections={currentSecondaryNav}
          currentPath={location.pathname}
          onNavigate={(path) => navigate(path)}
          onMenuToggle={handleSidebarToggle}
        />
        <main className="pt-16 px-2 sm:px-4 md:px-6 animate-fadeIn">
          <div className="container mx-auto py-6 min-h-[calc(100vh-4rem)] max-w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
