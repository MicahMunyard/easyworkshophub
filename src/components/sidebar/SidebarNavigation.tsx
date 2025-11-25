
import React from "react";
import { NavLink } from "react-router-dom";
import { ChevronRight, Home, Lock } from "lucide-react";
import { useSidebarIcons } from "./useSidebarIcons";
import { useTierAccess } from "@/hooks/useTierAccess";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface SidebarNavigationProps {
  activeSidebarSection: string | null;
  sidebarSections: Record<string, { name: string; path: string; icon: string; featureKey?: string }[]>;
}

const SidebarNavigation: React.FC<SidebarNavigationProps> = ({ 
  activeSidebarSection, 
  sidebarSections 
}) => {
  const iconMap = useSidebarIcons();
  
  // Get active sidebar items based on active section
  const getActiveItems = () => {
    if (!activeSidebarSection || !sidebarSections[activeSidebarSection]) {
      return [];
    }
    return sidebarSections[activeSidebarSection];
  };

  const activeItems = getActiveItems();

  return (
    <TooltipProvider>
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

        {activeItems.length > 0 && activeItems.map((item) => {
          const { hasAccess } = useTierAccess(item.featureKey || 'dashboard');
          
          if (!hasAccess) {
            return (
              <Tooltip key={item.name}>
                <TooltipTrigger asChild>
                  <div className="nav-item opacity-60 cursor-not-allowed group">
                    {iconMap[item.icon]}
                    <span className="text-muted-foreground">{item.name}</span>
                    <Lock className="h-4 w-4 ml-auto text-muted-foreground" />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Upgrade to Full Access to unlock</p>
                </TooltipContent>
              </Tooltip>
            );
          }

          return (
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
          );
        })}
      </nav>
    </TooltipProvider>
  );
};

export default SidebarNavigation;
