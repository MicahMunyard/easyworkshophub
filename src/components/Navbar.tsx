
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, LogOut, Settings, Menu, X } from "lucide-react";
import { useMobileMenu } from "@/hooks/use-mobile-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface NavbarProps {
  mainNavSections: { name: string; path: string }[];
  currentPath: string;
  onNavigate: (path: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ 
  mainNavSections, 
  currentPath, 
  onNavigate 
}) => {
  const { isOpen, toggleMenu } = useMobileMenu();
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const initials = profile?.full_name
    ? profile.full_name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
    : user?.email?.substring(0, 2).toUpperCase() || "U";

  // Determine the current active tab based on path
  const getCurrentTab = () => {
    if (currentPath === '/') return 'dashboard';
    if (currentPath === '/workshop' || currentPath.includes('/booking-diary') || currentPath.includes('/jobs') || currentPath.includes('/workshop-setup')) return 'workshop';
    if (currentPath.includes('/email-integration')) return 'email';
    if (currentPath.includes('/inventory') || currentPath.includes('/suppliers')) return 'inventory';
    if (currentPath.includes('/customers')) return 'customers';
    if (currentPath.includes('/marketing') || currentPath.includes('/email-marketing') || currentPath.includes('/reviews')) return 'marketing';
    if (currentPath.includes('/reports')) return 'reports';
    return 'dashboard';
  };

  // Handle tab change
  const handleTabChange = (value: string) => {
    const section = mainNavSections.find(section => section.name.toLowerCase() === value);
    if (section) {
      onNavigate(section.path);
    }
  };

  return (
    <header className="sticky top-0 z-30 w-full">
      {/* Top Bar */}
      <div className="h-16 border-b bg-background">
        <div className="container h-full flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2">
              <img
                src="/lovable-uploads/toliccs-logo.png"
                alt="Toliccs Logo"
                className="w-8 h-8"
                width={32}
                height={32}
              />
              <span className="font-bold text-xl hidden sm:inline-block">
                Toliccs
              </span>
            </Link>

            {/* Main Navigation Tabs - Moved to be next to the logo */}
            <div className="hidden md:block">
              <Tabs value={getCurrentTab()} onValueChange={handleTabChange} className="w-full">
                <TabsList className="bg-transparent h-12 justify-start px-0 gap-1">
                  {mainNavSections.map((section) => (
                    <TabsTrigger 
                      key={section.name} 
                      value={section.name.toLowerCase()}
                      className="h-10 px-4 data-[state=active]:bg-muted data-[state=active]:shadow-none transition-all"
                    >
                      {section.name}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
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
                  width={32}
                  height={32}
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

            {/* Mobile Navigation Tabs */}
            <div className="lg:hidden mt-4">
              <Tabs value={getCurrentTab()} onValueChange={handleTabChange} className="w-full">
                <TabsList className="bg-transparent h-auto w-full flex-col items-stretch justify-start px-0 gap-1">
                  {mainNavSections.map((section) => (
                    <TabsTrigger 
                      key={section.name} 
                      value={section.name.toLowerCase()}
                      className="h-10 w-full justify-start px-4 data-[state=active]:bg-muted data-[state=active]:shadow-none transition-all"
                    >
                      {section.name}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
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
      </div>
    </header>
  );
};

export default Navbar;
