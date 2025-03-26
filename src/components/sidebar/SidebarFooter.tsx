
import React from "react";
import { NavLink } from "react-router-dom";
import { Settings, HelpCircle } from "lucide-react";

const SidebarFooter: React.FC = () => {
  return (
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
  );
};

export default SidebarFooter;
