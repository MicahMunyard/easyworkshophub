
import React from "react";
import { NavLink } from "react-router-dom";
import { HelpCircle, Wrench } from "lucide-react";

const SidebarFooter: React.FC = () => {
  return (
    <div className="border-t border-sidebar-border pt-4 mt-4">
      <NavLink
        to="/workshop-setup"
        className={({ isActive }) => 
          `nav-item ${isActive ? "active" : ""}`
        }
      >
        <Wrench className="h-5 w-5" />
        <span>Workshop Setup</span>
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
