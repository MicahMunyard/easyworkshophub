
import React from "react";
import { Link } from "react-router-dom";
import { Menu, Bell, Search, X, User, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";

interface NavbarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const Navbar: React.FC<NavbarProps> = ({ sidebarOpen, setSidebarOpen }) => {
  const { user, profile, signOut, loading } = useAuth();

  const getInitials = () => {
    if (profile?.full_name) {
      return profile.full_name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase();
    }
    return user?.email?.substring(0, 2).toUpperCase() || 'JD';
  };

  return (
    <header className="sticky top-0 z-30 border-b bg-background/90 backdrop-blur-sm">
      <div className="flex h-16 items-center px-4 md:px-6">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle Menu"
          >
            {sidebarOpen ? (
              <X className="h-5 w-5 text-muted-foreground" />
            ) : (
              <Menu className="h-5 w-5 text-muted-foreground" />
            )}
          </Button>
          <div className="hidden md:flex items-center gap-3">
            <img 
              src="/lovable-uploads/81d792e6-3434-4c42-a968-ea14a4bfa07b.png" 
              alt="TOLICCS Logo" 
              className="h-10 w-auto"
            />
          </div>
        </div>

        <div className="ml-auto flex items-center gap-4">
          <div className="relative hidden md:block">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search..."
              className="rounded-full bg-secondary pl-8 pr-4 py-2 text-sm w-[200px] lg:w-[280px] focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5 text-muted-foreground" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                className="rounded-full h-8 w-8 overflow-hidden border border-border"
                variant="ghost"
                aria-label="User menu"
              >
                <span className="sr-only">User menu</span>
                {user ? (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={profile?.avatar_url || ''} alt={profile?.full_name || user.email || ''} />
                    <AvatarFallback className="bg-workshop-red text-primary-foreground">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-workshop-red text-primary-foreground">
                    <span className="text-xs font-medium">JD</span>
                  </div>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 mt-1 animate-slideUp">
              <DropdownMenuLabel>
                {user ? (
                  <div className="flex flex-col space-y-1">
                    <p className="font-medium">{profile?.full_name || 'Workshop Owner'}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                ) : (
                  'My Account'
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              {user ? (
                <>
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer flex w-full items-center">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/settings" className="cursor-pointer flex w-full items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => signOut()}
                    className="cursor-pointer text-red-500 focus:text-red-500"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </>
              ) : (
                <DropdownMenuItem asChild>
                  <Link to="/auth/signin" className="cursor-pointer flex w-full items-center">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign In
                  </Link>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
