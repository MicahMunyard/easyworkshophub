
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
        tier: "tier2" as const,
        featureKey: "ezyparts"
      },
      {
        name: "Search",
        href: "/ezyparts/search",
        icon: Search,
        tier: "tier2" as const,
        featureKey: "ezyparts"
      }
    ],
  },
]

// Main navigation sections for the sidebar
export const mainNavSections = [
  {
    name: "Dashboard",
    path: "/",
    icon: "LayoutDashboard",
    tier: "tier1" as const,
    featureKey: "dashboard"
  },
  {
    name: "Bookings",
    path: "/booking-diary",
    icon: "Calendar",
    tier: "tier1" as const,
    featureKey: "bookings"
  },
  {
    name: "Invoicing",
    path: "/invoicing",
    icon: "FileText",
    tier: "tier2" as const,
    featureKey: "invoicing"
  },
  {
    name: "Email",
    path: "/email-integration",
    icon: "Mail",
    tier: "tier2" as const,
    featureKey: "email"
  },
  {
    name: "Communication",
    path: "/communication",
    icon: "MessageSquare",
    tier: "tier2" as const,
    featureKey: "communication"
  },
  {
    name: "Inventory",
    path: "/inventory",
    icon: "Package",
    tier: "tier2" as const,
    featureKey: "inventory"
  },
  {
    name: "Customers",
    path: "/customers",
    icon: "Users",
    tier: "tier1" as const,
    featureKey: "customers"
  },
  {
    name: "Marketing",
    path: "/marketing",
    icon: "Megaphone",
    tier: "tier2" as const,
    featureKey: "marketing"
  },
  {
    name: "Reports",
    path: "/reports",
    icon: "BarChart3",
    tier: "tier2" as const,
    featureKey: "reports"
  },
  {
    name: "Timesheets",
    path: "/timesheets",
    icon: "Clock",
    tier: "tier2" as const,
    featureKey: "timesheets"
  }
];

// Secondary navigation sections that appear in the top navbar based on the current main section
export const secondaryNavSections: Record<string, { name: string; path: string; featureKey?: string }[]> = {
  bookings: [
    { name: "Booking Diary", path: "/booking-diary", featureKey: "bookings" },
    { name: "Jobs", path: "/jobs", featureKey: "bookings" }
  ],
  inventory: [
    { name: "Inventory", path: "/inventory", featureKey: "inventory" }
  ],
  marketing: [
    { name: "Marketing", path: "/marketing", featureKey: "marketing" },
    { name: "Email Marketing", path: "/email-marketing", featureKey: "marketing" },
    { name: "Reviews", path: "/reviews", featureKey: "marketing" }
  ],
  timesheets: [
    { name: "Timesheet Overview", path: "/timesheets", featureKey: "timesheets" },
    { name: "Time Entries", path: "/timesheets/entries", featureKey: "timesheets" }
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
