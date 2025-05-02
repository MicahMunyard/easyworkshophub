
import React from "react";
import { Bell, HelpCircle, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import NavProfile from "./NavProfile";
import NotificationBell from "./NotificationBell";
import { Link } from "react-router-dom";

interface NavActionsProps {
  isMobile?: boolean;
}

const NavActions: React.FC<NavActionsProps> = ({ isMobile = false }) => {
  const actionClass = isMobile 
    ? "flex flex-col items-center gap-6"
    : "flex items-center gap-2";

  return (
    <div className={actionClass}>
      <Button
        variant="ghost"
        size="icon"
        className="text-white hover:bg-white/10"
        asChild
      >
        <Link to="/help">
          <HelpCircle className="h-5 w-5" />
        </Link>
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="text-white hover:bg-white/10"
        asChild
      >
        <Link to="/settings">
          <Settings className="h-5 w-5" />
        </Link>
      </Button>
      <NotificationBell />
      <NavProfile />
    </div>
  );
};

export default NavActions;
