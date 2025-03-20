
import React from "react";
import { NavLink } from "react-router-dom";
import {
  Home,
  Calendar,
  Package,
  Users,
  Briefcase,
  FileText,
  ShoppingCart,
  BarChart3,
  Settings,
  Truck,
  HelpCircle,
  ChevronRight,
  Megaphone,
  Mail,
  Star
} from "lucide-react";

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const navItems = [
  { name: "Dashboard", icon: Home, path: "/" },
  { name: "Booking Diary", icon: Calendar, path: "/booking-diary" },
  { name: "Jobs", icon: Briefcase, path: "/jobs" },
  { name: "Inventory", icon: Package, path: "/inventory" },
  { name: "Customers", icon: Users, path: "/customers" },
  { name: "Invoices", icon: FileText, path: "/invoices" },
  { name: "Point of Sale", icon: ShoppingCart, path: "/pos" },
  { name: "Suppliers", icon: Truck, path: "/suppliers" },
  { name: "Reports", icon: BarChart3, path: "/reports" },
  { name: "Marketing", icon: Megaphone, path: "/marketing" },
  { name: "Email Marketing", icon: Mail, path: "/email-marketing" },
  { name: "Reviews", icon: Star, path: "/reviews" },
];

const Sidebar: React.FC<SidebarProps> = ({ open, setOpen }) => {
  return (
    <>
      {/* Overlay for mobile */}
      {open && (
        <div
          className="fixed inset-0 z-20 bg-black/70 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-20 h-full w-64 transform overflow-y-auto border-r border-sidebar-border bg-sidebar pt-16 transition-transform duration-300 ease-in-out lg:static lg:z-0 lg:pt-0 ${
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0 lg:w-0"
        }`}
      >
        <div className="px-3 py-4 h-full flex flex-col">
          <div className="mb-8 px-3">
            <div className="flex items-center gap-2">
              <img 
                src="/lovable-uploads/81d792e6-3434-4c42-a968-ea14a4bfa07b.png" 
                alt="TOLICCS Logo" 
                className="h-8 w-auto lg:hidden"
              />
              <p className="text-xs uppercase font-medium text-muted-foreground tracking-wider">
                Workshop Management
              </p>
            </div>
          </div>

          <nav className="space-y-1 flex-1">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) => 
                  `nav-item group ${isActive ? "active" : ""}`
                }
              >
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
                <ChevronRight className="h-4 w-4 ml-auto opacity-0 group-hover:opacity-70 transition-opacity" />
              </NavLink>
            ))}
          </nav>

          <div className="border-t border-sidebar-border pt-4 mt-4">
            <NavLink
              to="/settings"
              className={({ isActive }) => 
                `nav-item ${isActive ? "active" : ""}`
              }
            >
              <Settings className="h-5 w-5" />
              <span>Settings</span>
            </NavLink>
            <NavLink
              to="/help"
              className={({ isActive }) => 
                `nav-item ${isActive ? "active" : ""}`
              }
            >
              <HelpCircle className="h-5 w-5" />
              <span>Help & Support</span>
            </NavLink>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
