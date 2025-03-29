
import React from "react";
import { cn } from "@/lib/utils";

interface NavTabsProps {
  currentTab: string;
  onTabChange: (value: string) => void;
  sections: { name: string; path: string }[];
  isMobile?: boolean;
  isSidebar?: boolean;
  isTopNav?: boolean;
}

const NavTabs: React.FC<NavTabsProps> = ({ 
  currentTab, 
  onTabChange, 
  sections,
  isMobile = false,
  isSidebar = false,
  isTopNav = false
}) => {
  return (
    <nav className={cn(
      "w-full", 
      isMobile && "flex flex-col items-stretch gap-2",
      isSidebar && "flex flex-col items-stretch gap-1 px-2",
      isTopNav && "flex items-center gap-6"
    )}>
      {sections.map((section) => {
        const isActive = section.name.toLowerCase() === currentTab;
        return (
          <button
            key={section.name}
            onClick={() => onTabChange(section.name.toLowerCase())}
            className={cn(
              "text-white relative transition-all duration-300",
              isMobile && "px-2 py-3 text-left hover:bg-white/10 rounded-md",
              isSidebar && "px-4 py-3 text-left hover:bg-white/10 rounded-md group",
              isTopNav && "px-3 py-1 text-sm font-medium hover:text-white/80",
              isActive && isSidebar && "bg-white/5",
              isActive && isTopNav && "font-semibold"
            )}
          >
            <span className={cn(
              "relative block",
              isActive && !isSidebar && !isTopNav && "font-medium",
              isActive && isTopNav && "font-medium"
            )}>
              {section.name}
              {isActive && (
                <span 
                  className={cn(
                    "absolute bg-workshop-red",
                    isSidebar ? "w-1 left-[-16px] top-0 h-full rounded-r" : 
                    isTopNav ? "h-0.5 bottom-[-8px] left-0 w-full" : 
                    "h-0.5 bottom-[-8px] left-0 w-full"
                  )} 
                  aria-hidden="true"
                />
              )}
            </span>
          </button>
        );
      })}
    </nav>
  );
};

export default NavTabs;
