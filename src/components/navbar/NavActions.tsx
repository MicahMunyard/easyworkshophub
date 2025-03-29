
import React from "react";
import { cn } from "@/lib/utils";
import NavProfile from "./NavProfile";
import { ModeToggle } from "@/components/ui/mode-toggle";

interface NavActionsProps {
  isMobile?: boolean;
}

const NavActions: React.FC<NavActionsProps> = ({ isMobile = false }) => {
  return (
    <div 
      className={cn(
        isMobile ? "flex flex-col items-center gap-4" : "hidden lg:flex lg:items-center lg:gap-4 ml-auto"
      )}
    >
      <NavProfile />
      <ModeToggle />
    </div>
  );
};

export default NavActions;
