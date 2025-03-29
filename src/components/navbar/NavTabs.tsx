
import React from "react";
import { cn } from "@/lib/utils";

interface NavTabsProps {
  currentTab: string;
  onTabChange: (value: string) => void;
  sections: { name: string; path: string }[];
  isMobile?: boolean;
  isSidebar?: boolean;
}

const NavTabs: React.FC<NavTabsProps> = ({ 
  currentTab, 
  onTabChange, 
  sections,
  isMobile = false,
  isSidebar = false
}) => {
  return (
    <nav className={cn(
      "w-full", 
      isMobile && "flex flex-col items-stretch gap-2",
      isSidebar && "flex flex-col items-stretch gap-1 px-2"
    )}>
      {sections.map((section) => {
        const isActive = section.name.toLowerCase() === currentTab;
        return (
          <button
            key={section.name}
            onClick={() => onTabChange(section.name.toLowerCase())}
            className={cn(
              "text-white text-left py-3 relative transition-all duration-300",
              isMobile && "px-2 hover:bg-white/10 rounded-md",
              isSidebar && "px-4 hover:bg-white/10 rounded-md group",
              isActive && isSidebar && "bg-white/5"
            )}
          >
            <span className={cn(
              "relative block",
              isActive && !isSidebar && "font-medium"
            )}>
              {section.name}
              {isActive && (
                <span 
                  className={cn(
                    "absolute bg-workshop-red",
                    isSidebar ? "w-1 left-[-16px] top-0 h-full rounded-r" : "h-0.5 bottom-[-8px] left-0 w-full"
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
