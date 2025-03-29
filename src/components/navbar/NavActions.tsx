
import React from "react";
import { cn } from "@/lib/utils";
import NavProfile from "./NavProfile";
import { ModeToggle } from "@/components/ui/mode-toggle";

interface NavActionsProps {
  isMobile?: boolean;
  isSidebar?: boolean;
}

const NavActions: React.FC<NavActionsProps> = ({ isMobile = false, isSidebar = false }) => {
  return (
    <div 
      className={cn(
        "flex items-center gap-4 text-white",
        isMobile && "flex-col",
        isSidebar && "flex-col w-full"
      )}
    >
      <NavProfile />
      <ModeToggle className="text-white" />
    </div>
  );
};

export default NavActions;
