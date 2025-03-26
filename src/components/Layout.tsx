
import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./navbar";
import { useLocation, useNavigate } from "react-router-dom";

interface LayoutProps {
  children: React.ReactNode;
}

// Define our main navigation sections
const mainNavSections = [
  { name: "Dashboard", path: "/" },
  { name: "Workshop", path: "/workshop" },
  { name: "Email", path: "/email-integration" },
  { name: "Inventory", path: "/inventory" },
  { name: "Customers", path: "/customers" },
  { name: "Marketing", path: "/marketing" },
  { name: "Reports", path: "/reports" }
];

// Define sidebar items for each section
const sidebarSections = {
  workshop: [
    { name: "Booking Diary", path: "/booking-diary", icon: "Calendar" },
    { name: "Jobs", path: "/jobs", icon: "Briefcase" },
    { name: "Workshop Setup", path: "/workshop-setup", icon: "Settings" }
  ],
  email: [
    { name: "Email Integration", path: "/email-integration", icon: "Mail" }
  ],
  inventory: [
    { name: "Inventory", path: "/inventory", icon: "Package" },
    { name: "Suppliers", path: "/suppliers", icon: "Truck" }
  ],
  customers: [
    { name: "Customers", path: "/customers", icon: "Users" }
  ],
  marketing: [
    { name: "Marketing", path: "/marketing", icon: "Megaphone" },
    { name: "Email Marketing", path: "/email-marketing", icon: "Mail" },
    { name: "Reviews", path: "/reviews", icon: "Star" }
  ]
};

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [activeSidebarSection, setActiveSidebarSection] = useState<keyof typeof sidebarSections | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Check if mobile on mount and when window resizes
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
    
    return () => {
      window.removeEventListener("resize", checkIfMobile);
    };
  }, []);

  // Set the active sidebar section based on the current path
  useEffect(() => {
    const path = location.pathname;
    
    if (path === '/workshop' || path.includes('/booking-diary') || path.includes('/jobs') || path.includes('/workshop-setup')) {
      setActiveSidebarSection('workshop');
    } else if (path.includes('/email-integration')) {
      setActiveSidebarSection('email');
    } else if (path.includes('/inventory') || path.includes('/suppliers')) {
      setActiveSidebarSection('inventory');
    } else if (path.includes('/customers')) {
      setActiveSidebarSection('customers');
    } else if (path.includes('/marketing') || path.includes('/email-marketing') || path.includes('/reviews')) {
      setActiveSidebarSection('marketing');
    } else {
      setActiveSidebarSection(null);
    }
  }, [location]);

  // Close sidebar on mobile when route changes
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar 
        mainNavSections={mainNavSections} 
        currentPath={location.pathname}
        onNavigate={(path) => navigate(path)}
      />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          open={sidebarOpen} 
          setOpen={setSidebarOpen} 
          activeSidebarSection={activeSidebarSection}
          sidebarSections={sidebarSections}
        />
        <main
          className={`flex-1 overflow-auto transition-all duration-300 ease-in-out
            ${sidebarOpen ? "lg:ml-64" : "ml-0"}`}
        >
          <div className="container py-6 px-4 md:px-6 mx-auto min-h-[calc(100vh-4rem)] animate-fadeIn">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
