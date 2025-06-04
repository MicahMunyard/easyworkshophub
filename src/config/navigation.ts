
import { 
  LayoutDashboard, 
  Calendar, 
  FileText, 
  Mail, 
  MessageSquare, 
  Package, 
  Users, 
  BarChart3, 
  Clock, 
  Settings, 
  Wrench,
  Search,
  Car,
  FileCode,
  HelpCircle,
  Megaphone
} from "lucide-react"

export const dashboardConfig = {
  sidebarNav: [
    {
      title: "General",
      items: [
        {
          title: "Dashboard",
          href: "/dashboard",
          icon: LayoutDashboard,
          description: "Overview of your account",
        },
      ],
    },
    {
      title: "Inventory",
      items: [
        {
          title: "Inventory",
          href: "/inventory",
          icon: Car,
          description: "Manage your inventory",
        },
      ],
    },
    {
      title: "Customers",
      items: [
        {
          title: "Customers",
          href: "/customers",
          icon: Users,
          description: "Manage your customers",
        },
      ],
    },
    {
      title: "Integrations",
      items: [
        {
          title: "EzyParts",
          href: "/ezyparts",
          icon: FileCode,
          description: "EzyParts integration",
        },
      ],
    },
    {
      title: "Settings",
      items: [
        {
          title: "Account",
          href: "/settings/account",
          icon: Settings,
          description: "Manage your account settings",
        },
      ],
    },
  ],
}

export const mainNav = [
  {
    name: "EzyParts",
    items: [
      {
        name: "Dashboard",
        href: "/ezyparts",
        icon: LayoutDashboard,
      },
      {
        name: "Search",
        href: "/ezyparts/search",
        icon: Search,
      }
    ],
  },
]

// Main navigation sections for the sidebar
export const mainNavSections = [
  {
    name: "Dashboard",
    path: "/",
    icon: "LayoutDashboard"
  },
  {
    name: "Bookings",
    path: "/booking-diary",
    icon: "Calendar"
  },
  {
    name: "Invoicing",
    path: "/invoicing",
    icon: "FileText"
  },
  {
    name: "Email",
    path: "/email-integration",
    icon: "Mail"
  },
  {
    name: "Communication",
    path: "/communication",
    icon: "MessageSquare"
  },
  {
    name: "Inventory",
    path: "/inventory",
    icon: "Package"
  },
  {
    name: "Customers",
    path: "/customers",
    icon: "Users"
  },
  {
    name: "Marketing",
    path: "/marketing",
    icon: "Megaphone"
  },
  {
    name: "Reports",
    path: "/reports",
    icon: "BarChart3"
  },
  {
    name: "Timesheets",
    path: "/timesheets",
    icon: "Clock"
  }
];

// Secondary navigation sections that appear in the top navbar based on the current main section
export const secondaryNavSections: Record<string, { name: string; path: string }[]> = {
  bookings: [
    { name: "Booking Diary", path: "/booking-diary" },
    { name: "Jobs", path: "/jobs" }
  ],
  inventory: [
    { name: "Inventory", path: "/inventory" },
    { name: "Suppliers", path: "/suppliers" }
  ],
  marketing: [
    { name: "Marketing", path: "/marketing" },
    { name: "Email Marketing", path: "/email-marketing" },
    { name: "Reviews", path: "/reviews" }
  ],
  timesheets: [
    { name: "Timesheet Overview", path: "/timesheets" },
    { name: "Time Entries", path: "/timesheets/entries" }
  ]
};

// Settings navigation sections that appear at the bottom of the sidebar
export const settingsNavSections = [
  {
    name: "Workshop Setup",
    path: "/workshop-setup",
    icon: "Wrench"
  },
  {
    name: "Settings",
    path: "/settings",
    icon: "Settings"
  },
  {
    name: "Help & Support",
    path: "/help",
    icon: "HelpCircle"
  }
];
