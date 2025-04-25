
import {
  LayoutDashboard,
  Hammer,
  Mail,
  MessageCircle,
  Package,
  Users,
  Megaphone,
  FileBarChart,
  Receipt,
  Clock
} from "lucide-react";

export interface NavSection {
  name: string;
  path: string;
  icon: JSX.Element;
}

export interface SubNavSection {
  name: string;
  path: string;
}

export const mainNavSections = [
  { name: "Dashboard", path: "/", icon: <LayoutDashboard className="h-5 w-5" /> },
  { name: "Workshop", path: "/workshop", icon: <Hammer className="h-5 w-5" /> },
  { name: "Invoicing", path: "/invoicing", icon: <Receipt className="h-5 w-5" /> },
  { name: "Email", path: "/email-integration", icon: <Mail className="h-5 w-5" /> },
  { name: "Communication", path: "/communication", icon: <MessageCircle className="h-5 w-5" /> },
  { name: "Inventory", path: "/inventory", icon: <Package className="h-5 w-5" /> },
  { name: "Customers", path: "/customers", icon: <Users className="h-5 w-5" /> },
  { name: "Marketing", path: "/marketing", icon: <Megaphone className="h-5 w-5" /> },
  { name: "Reports", path: "/reports", icon: <FileBarChart className="h-5 w-5" /> },
  { name: "Timesheets", path: "/timesheets", icon: <Clock className="h-5 w-5" /> }
];

export const secondaryNavSections: Record<string, SubNavSection[]> = {
  workshop: [
    { name: "Booking Diary", path: "/booking-diary" },
    { name: "Jobs", path: "/jobs" },
    { name: "Workshop Setup", path: "/workshop-setup" }
  ],
  invoicing: [
    { name: "Invoicing", path: "/invoicing" }
  ],
  email: [
    { name: "Email Integration", path: "/email-integration" }
  ],
  communication: [
    { name: "Communication", path: "/communication" }
  ],
  inventory: [
    { name: "Inventory", path: "/inventory" },
    { name: "Suppliers", path: "/suppliers" }
  ],
  customers: [
    { name: "Customers", path: "/customers" }
  ],
  marketing: [
    { name: "Marketing", path: "/marketing" },
    { name: "Email Marketing", path: "/email-marketing" },
    { name: "Reviews", path: "/reviews" }
  ],
  reports: [
    { name: "Reports", path: "/reports" }
  ],
  timesheets: [
    { name: "Timesheet Overview", path: "/timesheets" },
    { name: "Time Entries", path: "/timesheets/entries" }
  ]
};
