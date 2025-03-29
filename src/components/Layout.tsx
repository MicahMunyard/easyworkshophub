
import React, { useState, useEffect } from "react";
import Navbar from "./navbar";
import { useLocation, useNavigate } from "react-router-dom";

interface LayoutProps {
  children: React.ReactNode;
}

const mainNavSections = [
  { name: "Dashboard", path: "/" },
  { name: "Workshop", path: "/workshop" },
  { name: "Email", path: "/email-integration" },
  { name: "Inventory", path: "/inventory" },
  { name: "Customers", path: "/customers" },
  { name: "Marketing", path: "/marketing" },
  { name: "Reports", path: "/reports" }
];

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
    
    return () => {
      window.removeEventListener("resize", checkIfMobile);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar 
        mainNavSections={mainNavSections} 
        currentPath={location.pathname}
        onNavigate={(path) => navigate(path)}
      />
      <div className="flex flex-1 overflow-hidden pt-16">
        <main
          className="flex-1 overflow-auto transition-all duration-300 ease-in-out lg:ml-64"
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
