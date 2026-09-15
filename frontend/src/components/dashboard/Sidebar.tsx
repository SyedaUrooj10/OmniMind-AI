"use client";

import Link from "next/link";
import {
  MessageSquare,
  FileText,
  Image,
  BarChart3,
  Bot,
  Settings,
  LayoutDashboard,
} from "lucide-react";

const menu = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
  },
  {
    title: "AI Chat",
    icon: MessageSquare,
    href: "/dashboard/chat",
  },
  {
    title: "Documents",
    icon: FileText,
    href: "/dashboard/documents",
  },
  {
    title: "Vision AI",
    icon: Image,
    href: "/dashboard/vision",
  },
  {
    title: "Analytics",
    icon: BarChart3,
    href: "/dashboard/analytics",
  },
  {
    title: "AI Agents",
    icon: Bot,
    href: "/dashboard/agents",
  },
  {
    title: "Settings",
    icon: Settings,
    href: "/dashboard/settings",
  },
];

export default function Sidebar() {
  return (
    <aside className="glass flex h-screen w-72 flex-col border-r border-white/10 p-6">

      <h1 className="mb-10 text-3xl font-black">
        OmniMind
      </h1>

      <nav className="space-y-3">

        {menu.map((item) => {

          const Icon = item.icon;

          return (
            <Link
              key={item.title}
              href={item.href}
              className="flex items-center gap-3 rounded-xl px-4 py-3 transition hover:bg-white/10"
            >
              <Icon size={20} />

              {item.title}
            </Link>
          );
        })}

      </nav>
    </aside>
  );
}