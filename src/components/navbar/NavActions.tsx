
import React from "react";
import { Bell, Moon, Sun, Loader2 } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import NavProfile from "./NavProfile";
import NotificationBell from "./NotificationBell";

const NavActions = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, loading } = useAuth();

  return (
    <div className="flex items-center gap-2">
      {/* Theme Toggle */}
      <button
        className="rounded-full text-white/80 flex items-center justify-center transition hover:text-white hover:bg-white/10 w-8 h-8"
        onClick={toggleTheme}
      >
        {theme === "dark" ? (
          <Sun size={16} aria-hidden="true" />
        ) : (
          <Moon size={16} aria-hidden="true" />
        )}
        <span className="sr-only">
          {theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
        </span>
      </button>
      
      {/* Notification Bell */}
      <NotificationBell />

      {/* User Profile */}
      {loading ? (
        <Skeleton className="h-8 w-8 rounded-full" />
      ) : user ? (
        <NavProfile />
      ) : (
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-transparent border-2 border-white/20 text-white">
            <Loader2 className="h-4 w-4 animate-spin" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};

export default NavActions;
