
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
  activeSidebarSection: string | null;
  sidebarSections: Record<string, { name: string; path: string; icon: string }[]>;
}

// Icon mapping
const iconMap: Record<string, React.ReactElement> = {
  Home: <Home className="h-5 w-5" />,
  Calendar: <Calendar className="h-5 w-5" />,
  Package: <Package className="h-5 w-5" />,
  Users: <Users className="h-5 w-5" />,
  Briefcase: <Briefcase className="h-5 w-5" />,
  FileText: <FileText className="h-5 w-5" />,
  ShoppingCart: <ShoppingCart className="h-5 w-5" />,
  BarChart3: <BarChart3 className="h-5 w-5" />,
  Settings: <Settings className="h-5 w-5" />,
  Truck: <Truck className="h-5 w-5" />,
  HelpCircle: <HelpCircle className="h-5 w-5" />,
  Megaphone: <Megaphone className="h-5 w-5" />,
  Mail: <Mail className="h-5 w-5" />,
  Star: <Star className="h-5 w-5" />
};

const Sidebar: React.FC<SidebarProps> = ({ open, setOpen, activeSidebarSection, sidebarSections }) => {
  // Get active sidebar items based on active section
  const getActiveItems = () => {
    if (!activeSidebarSection || !sidebarSections[activeSidebarSection]) {
      return [];
    }
    return sidebarSections[activeSidebarSection];
  };

  const activeItems = getActiveItems();

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
            {!activeSidebarSection && (
              <NavLink
                to="/"
                className={({ isActive }) => 
                  `nav-item group ${isActive ? "active" : ""}`
                }
              >
                <Home className="h-5 w-5" />
                <span>Dashboard</span>
                <ChevronRight className="h-4 w-4 ml-auto opacity-0 group-hover:opacity-70 transition-opacity" />
              </NavLink>
            )}

            {activeItems.length > 0 && activeItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) => 
                  `nav-item group ${isActive ? "active" : ""}`
                }
              >
                {iconMap[item.icon]}
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
