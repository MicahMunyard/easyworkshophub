
import React from "react";
import SidebarOverlay from "./SidebarOverlay";
import SidebarContent from "./SidebarContent";

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  activeSidebarSection: string | null;
  sidebarSections: Record<string, { name: string; path: string; icon: string }[]>;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  open, 
  setOpen, 
  activeSidebarSection, 
  sidebarSections 
}) => {
  return (
    <>
      {/* Overlay for mobile */}
      <SidebarOverlay open={open} onClick={() => setOpen(false)} />

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-20 h-full w-64 transform overflow-y-auto border-r border-sidebar-border bg-sidebar pt-16 transition-transform duration-300 ease-in-out lg:static lg:z-0 lg:pt-0 ${
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0 lg:w-0"
        }`}
      >
        <SidebarContent 
          activeSidebarSection={activeSidebarSection} 
          sidebarSections={sidebarSections} 
        />
      </aside>
    </>
  );
};

export default Sidebar;
