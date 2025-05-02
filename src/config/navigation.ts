
import React from "react";
import {
  LayoutDashboard,
  Mail,
  MessageCircle,
  Package,
  Users,
  Megaphone,
  FileBarChart,
  Receipt,
  Clock,
  Calendar,
  Settings,
  Wrench,
  Hammer,
  Tool
} from "lucide-react";

export interface NavSection {
  name: string;
  path: string;
  icon: React.ReactNode;
}

export interface SubNavSection {
  name: string;
  path: string;
}

export const mainNavSections: NavSection[] = [
  { name: "Dashboard", path: "/", icon: React.createElement(LayoutDashboard, { className: "h-5 w-5" }) },
  { name: "Bookings", path: "/booking-diary", icon: React.createElement(Calendar, { className: "h-5 w-5" }) },
  { name: "Invoicing", path: "/invoicing", icon: React.createElement(Receipt, { className: "h-5 w-5" }) },
  { name: "Email", path: "/email-integration", icon: React.createElement(Mail, { className: "h-5 w-5" }) },
  { name: "Communication", path: "/communication", icon: React.createElement(MessageCircle, { className: "h-5 w-5" }) },
  { name: "Inventory", path: "/inventory", icon: React.createElement(Package, { className: "h-5 w-5" }) },
  { name: "Customers", path: "/customers", icon: React.createElement(Users, { className: "h-5 w-5" }) },
  { name: "Marketing", path: "/marketing", icon: React.createElement(Megaphone, { className: "h-5 w-5" }) },
  { name: "Reports", path: "/reports", icon: React.createElement(FileBarChart, { className: "h-5 w-5" }) },
  { name: "Timesheets", path: "/timesheets", icon: React.createElement(Clock, { className: "h-5 w-5" }) },
  { name: "Workshop", path: "/workshop", icon: React.createElement(Wrench, { className: "h-5 w-5" }) },
  { name: "EzyParts", path: "/ezyparts/dashboard", icon: React.createElement(Hammer, { className: "h-5 w-5" }) },
  { name: "Technician Portal", path: "/technician-portal", icon: React.createElement(Tool, { className: "h-5 w-5" }) }
];

export const secondaryNavSections: Record<string, SubNavSection[]> = {
  bookings: [
    { name: "Booking Diary", path: "/booking-diary" },
    { name: "Jobs", path: "/jobs" }
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
  ],
  workshop: [
    { name: "Workshop", path: "/workshop" }
  ],
  ezyparts: [
    { name: "Dashboard", path: "/ezyparts/dashboard" },
    { name: "Search", path: "/ezyparts/search" },
    { name: "Quote", path: "/ezyparts/quote" },
    { name: "Diagnostic", path: "/ezyparts/diagnostic" },
    { name: "Config", path: "/ezyparts/config" }
  ],
  technician: [
    { name: "Technician Portal", path: "/technician-portal" }
  ]
};

// Add a new section for settings/setup pages that will appear at the bottom of the sidebar
export const settingsNavSections: NavSection[] = [
  { name: "Workshop Setup", path: "/workshop-setup", icon: React.createElement(Settings, { className: "h-5 w-5" }) }
];
