
import React from "react";
import SidebarHeader from "./SidebarHeader";
import SidebarNavigation from "./SidebarNavigation";
import SidebarFooter from "./SidebarFooter";

interface SidebarContentProps {
  activeSidebarSection: string | null;
  sidebarSections: Record<string, { name: string; path: string; icon: string }[]>;
}

const SidebarContent: React.FC<SidebarContentProps> = ({ 
  activeSidebarSection, 
  sidebarSections 
}) => {
  return (
    <div className="px-3 py-4 h-full flex flex-col">
      <SidebarHeader />
      <SidebarNavigation 
        activeSidebarSection={activeSidebarSection}
        sidebarSections={sidebarSections}
      />
      <SidebarFooter />
    </div>
  );
};

export default SidebarContent;
