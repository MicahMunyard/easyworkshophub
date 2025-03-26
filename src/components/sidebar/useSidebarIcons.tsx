
import React from "react";
import {
  Home,
  Calendar,
  Package,
  Users,
  Briefcase,
  FileText,
  ShoppingCart,
  BarChart3,
  Settings,
  Truck,
  HelpCircle,
  Megaphone,
  Mail,
  Star
} from "lucide-react";

export const useSidebarIcons = () => {
  // Icon mapping
  const iconMap: Record<string, React.ReactElement> = {
    Home: <Home className="h-5 w-5" />,
    Calendar: <Calendar className="h-5 w-5" />,
    Package: <Package className="h-5 w-5" />,
    Users: <Users className="h-5 w-5" />,
    Briefcase: <Briefcase className="h-5 w-5" />,
    FileText: <FileText className="h-5 w-5" />,
    ShoppingCart: <ShoppingCart className="h-5 w-5" />,
    BarChart3: <BarChart3 className="h-5 w-5" />,
    Settings: <Settings className="h-5 w-5" />,
    Truck: <Truck className="h-5 w-5" />,
    HelpCircle: <HelpCircle className="h-5 w-5" />,
    Megaphone: <Megaphone className="h-5 w-5" />,
    Mail: <Mail className="h-5 w-5" />,
    Star: <Star className="h-5 w-5" />
  };

  return iconMap;
};
