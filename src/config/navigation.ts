import { LayoutDashboard, Search, Users, Settings, FileCode, Car } from "lucide-react"

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
