
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
  HelpCircle
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
    icon: <LayoutDashboard className="h-5 w-5" />
  },
  {
    name: "Bookings",
    path: "/booking-diary",
    icon: <Calendar className="h-5 w-5" />
  },
  {
    name: "Invoicing",
    path: "/invoicing",
    icon: <FileText className="h-5 w-5" />
  },
  {
    name: "Email",
    path: "/email-integration",
    icon: <Mail className="h-5 w-5" />
  },
  {
    name: "Communication",
    path: "/communication",
    icon: <MessageSquare className="h-5 w-5" />
  },
  {
    name: "Inventory",
    path: "/inventory",
    icon: <Package className="h-5 w-5" />
  },
  {
    name: "Customers",
    path: "/customers",
    icon: <Users className="h-5 w-5" />
  },
  {
    name: "Marketing",
    path: "/marketing",
    icon: <BarChart3 className="h-5 w-5" />
  },
  {
    name: "Reports",
    path: "/reports",
    icon: <BarChart3 className="h-5 w-5" />
  },
  {
    name: "Timesheets",
    path: "/timesheets",
    icon: <Clock className="h-5 w-5" />
  },
  {
    name: "EzyParts",
    path: "/ezyparts",
    icon: <FileCode className="h-5 w-5" />
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
  ],
  ezyparts: [
    { name: "Dashboard", path: "/ezyparts" },
    { name: "Search", path: "/ezyparts/search" }
  ]
};

// Settings navigation sections that appear at the bottom of the sidebar
export const settingsNavSections = [
  {
    name: "Workshop Setup",
    path: "/workshop-setup",
    icon: <Wrench className="h-5 w-5" />
  },
  {
    name: "Settings",
    path: "/settings",
    icon: <Settings className="h-5 w-5" />
  },
  {
    name: "Help & Support",
    path: "/help",
    icon: <HelpCircle className="h-5 w-5" />
  }
];
