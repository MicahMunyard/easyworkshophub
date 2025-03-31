
import React, { useState, useEffect } from "react";
import Navbar from "./navbar";
import { useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Hammer,
  Mail,
  MessageCircle,
  Package,
  Users,
  Megaphone,
  FileBarChart
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface LayoutProps {
  children: React.ReactNode;
}

const mainNavSections = [
  { name: "Dashboard", path: "/", icon: <LayoutDashboard className="h-5 w-5" /> },
  { name: "Workshop", path: "/workshop", icon: <Hammer className="h-5 w-5" /> },
  { name: "Email", path: "/email-integration", icon: <Mail className="h-5 w-5" /> },
  { name: "Communication", path: "/communication", icon: <MessageCircle className="h-5 w-5" /> },
  { name: "Inventory", path: "/inventory", icon: <Package className="h-5 w-5" /> },
  { name: "Customers", path: "/customers", icon: <Users className="h-5 w-5" /> },
  { name: "Marketing", path: "/marketing", icon: <Megaphone className="h-5 w-5" /> },
  { name: "Reports", path: "/reports", icon: <FileBarChart className="h-5 w-5" /> }
];

// Define secondary navigation sections based on main sections
const secondaryNavSections = {
  workshop: [
    { name: "Booking Diary", path: "/booking-diary" },
    { name: "Jobs", path: "/jobs" },
    { name: "Workshop Setup", path: "/workshop-setup" }
  ],
  email: [
    { name: "Email Integration", path: "/email-integration" }
  ],
  communication: [
    { name: "Communication", path: "/communication" }
  ],
  inventory: [
    { name: "Inventory", path: "/inventory" },
    { name: "Suppliers", path: "/suppliers" }
  ],
  customers: [
    { name: "Customers", path: "/customers" }
  ],
  marketing: [
    { name: "Marketing", path: "/marketing" },
    { name: "Email Marketing", path: "/email-marketing" },
    { name: "Reviews", path: "/reviews" }
  ],
  reports: [
    { name: "Reports", path: "/reports" }
  ]
};

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const isMobile = useIsMobile();
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Get current main section based on path
  const getCurrentMainSection = (path: string): string => {
    if (path === '/') return 'dashboard';
    if (path.includes('/workshop') || path.includes('/booking-diary') || path.includes('/jobs') || path.includes('/workshop-setup')) return 'workshop';
    if (path.includes('/email')) return 'email';
    if (path.includes('/communication')) return 'communication';
    if (path.includes('/inventory') || path.includes('/suppliers')) return 'inventory';
    if (path.includes('/customers')) return 'customers';
    if (path.includes('/marketing') || path.includes('/email-marketing') || path.includes('/reviews')) return 'marketing';
    if (path.includes('/reports')) return 'reports';
    return 'dashboard';
  };

  const currentMainSection = getCurrentMainSection(location.pathname);

  // Get secondary nav based on current main section
  const currentSecondaryNav = secondaryNavSections[currentMainSection as keyof typeof secondaryNavSections] || [];

  // Auto-collapse sidebar on mobile
  useEffect(() => {
    if (isMobile) {
      setSidebarExpanded(false);
    }
  }, [isMobile, location.pathname]);

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      {/* Collapsible Sidebar */}
      <aside 
        className={`fixed top-0 left-0 h-full bg-black z-40 transition-all duration-300 ease-in-out pt-16 ${
          sidebarExpanded ? "w-64" : "w-16"
        }`}
        onMouseEnter={() => !isMobile && setSidebarExpanded(true)}
        onMouseLeave={() => !isMobile && setSidebarExpanded(false)}
      >
        <div className="flex flex-col h-full">
          {/* Main navigation icons */}
          <div className="flex-1 py-4 overflow-y-auto scrollbar-none">
            {mainNavSections.map((section) => {
              const isActive = section.name.toLowerCase() === currentMainSection;
              return (
                <button
                  key={section.name}
                  onClick={() => navigate(section.path)}
                  className={`flex items-center w-full py-3 px-4 text-white transition-colors hover:bg-white/10 relative ${
                    isActive ? "bg-white/5" : ""
                  }`}
                >
                  <span className="flex items-center justify-center">
                    {section.icon}
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
        </div>
      </aside>

      {/* Main content area */}
      <div className={`flex-1 transition-all duration-300 ${sidebarExpanded && !isMobile ? "ml-64" : "ml-16"}`}>
        <Navbar 
          secondaryNavSections={currentSecondaryNav}
          currentPath={location.pathname}
          onNavigate={(path) => navigate(path)}
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
