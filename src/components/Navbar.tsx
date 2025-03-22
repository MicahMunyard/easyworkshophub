
import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { User, LogOut, Settings, Menu, X } from "lucide-react";
import { useMobileMenu } from "@/hooks/use-mobile";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "./ui/mode-toggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

const Navbar = () => {
  const { isOpen, toggleMenu } = useMobileMenu();
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const initials = profile?.full_name
    ? profile.full_name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
    : user?.email?.substring(0, 2).toUpperCase() || "U";

  return (
    <header className="h-16 border-b sticky top-0 bg-background z-30">
      <div className="container h-full flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/" className="flex items-center gap-2">
            <img
              src="/lovable-uploads/toliccs-logo.png"
              alt="Toliccs Logo"
              className="w-8 h-8"
            />
            <span className="font-bold text-xl hidden sm:inline-block">
              Toliccs
            </span>
          </Link>
        </div>

        <nav
          className={cn(
            "fixed inset-0 bg-background p-6 flex flex-col gap-8 z-50 lg:static lg:p-0 lg:flex-row lg:gap-0 lg:items-center lg:bg-transparent transition-transform duration-300 lg:transform-none",
            isOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex items-center justify-between lg:hidden">
            <Link to="/" className="flex items-center gap-2">
              <img
                src="/lovable-uploads/toliccs-logo.png"
                alt="Toliccs Logo"
                className="w-8 h-8"
              />
              <span className="font-bold text-xl">Toliccs</span>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMenu}
              className="lg:hidden"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center gap-6 mt-8 lg:mt-0">
            <Link
              to="/"
              className={cn(
                "text-sm font-medium px-3 py-2 rounded-md transition-colors hover:bg-muted",
                location.pathname === "/" && "bg-muted"
              )}
            >
              Dashboard
            </Link>
            <Link
              to="/booking-diary"
              className={cn(
                "text-sm font-medium px-3 py-2 rounded-md transition-colors hover:bg-muted",
                location.pathname === "/booking-diary" && "bg-muted"
              )}
            >
              Booking Diary
            </Link>
            <Link
              to="/jobs"
              className={cn(
                "text-sm font-medium px-3 py-2 rounded-md transition-colors hover:bg-muted",
                location.pathname === "/jobs" && "bg-muted"
              )}
            >
              Jobs
            </Link>
            <Link
              to="/customers"
              className={cn(
                "text-sm font-medium px-3 py-2 rounded-md transition-colors hover:bg-muted",
                location.pathname === "/customers" && "bg-muted"
              )}
            >
              Customers
            </Link>
            <Link
              to="/inventory"
              className={cn(
                "text-sm font-medium px-3 py-2 rounded-md transition-colors hover:bg-muted",
                location.pathname === "/inventory" && "bg-muted"
              )}
            >
              Inventory
            </Link>
            <Link
              to="/workshop"
              className={cn(
                "text-sm font-medium px-3 py-2 rounded-md transition-colors hover:bg-muted",
                location.pathname === "/workshop" && "bg-muted"
              )}
            >
              Workshop Setup
            </Link>
          </div>

          <div className="mt-auto lg:mt-0 lg:ml-auto flex flex-col lg:flex-row items-center gap-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-9 w-9 rounded-full"
                  >
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-primary/10">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {profile?.full_name || "Workshop User"}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/profile")}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/settings")}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex gap-2">
                <Button size="sm" onClick={() => navigate("/auth/signin")} variant="outline">
                  Log in
                </Button>
                <Button size="sm" onClick={() => navigate("/auth/signup")}>
                  Sign up
                </Button>
              </div>
            )}
            <ModeToggle />
          </div>
        </nav>

        <div className="flex items-center gap-2 lg:hidden">
          <ModeToggle />
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMenu}
            className="lg:hidden"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
