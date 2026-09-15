"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Activity,
  BarChart3,
  BrainCircuit,
  Bot,
  Database,
  FileText,
  Home,
  LogOut,
  MessageSquare,
  Settings,
  Sparkles,
  Upload,
} from "lucide-react";
import { ReactNode } from "react";
import { removeToken } from "@/lib/auth";

interface DashboardLayoutProps {
  children: ReactNode;
}

interface NavigationItem {
  label: string;
  href: string;
  icon: typeof Home;
}

const navigationItems: NavigationItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: Home,
  },
  {
    label: "AI Chat",
    href: "/dashboard/chat",
    icon: MessageSquare,
  },
  {
    label: "Datasets",
    href: "/dashboard/datasets",
    icon: Database,
  },
  {
    label: "Intelligence",
    href: "/dashboard/intelligence",
    icon: BrainCircuit,
  },
  {
    label: "AI Agent",
    href: "/dashboard/agent",
    icon: Bot,
  },
  {
    label: "Reports",
    href: "/dashboard/reports",
    icon: FileText,
  },
];

const secondaryItems: NavigationItem[] = [
  {
    label: "Analytics",
    href: "/dashboard/datasets",
    icon: BarChart3,
  },
  {
    label: "Activity",
    href: "/dashboard",
    icon: Activity,
  },
];

export default function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }

    return (
      pathname === href ||
      pathname.startsWith(`${href}/`)
    );
  };

  const handleLogout = () => {
    removeToken();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-[#050816] text-white">
      <div className="flex min-h-screen">
        <aside className="fixed inset-y-0 left-0 z-50 hidden w-72 border-r border-white/10 bg-[#080b1a]/95 backdrop-blur-xl lg:flex lg:flex-col">
          <div className="flex h-20 items-center border-b border-white/10 px-6">
            <Link
              href="/dashboard"
              className="flex items-center gap-3"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl lg-gradient-to-br from-cyan-400 to-violet-600 shadow-lg shadow-cyan-500/20">
                <Sparkles className="h-5 w-5 text-white" />
              </div>

              <div>
                <p className="text-lg font-bold tracking-tight">
                  OmniMind
                </p>

                <p className="text-xs text-white/40">
                  AI Decision Intelligence
                </p>
              </div>
            </Link>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-6">
            <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/30">
              Workspace
            </p>

            <nav className="space-y-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all ${
                      active
                        ? "bg-white/10 text-white shadow-lg shadow-black/10"
                        : "text-white/50 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <Icon
                      className={`h-5 w-5 ${
                        active
                          ? "text-cyan-400"
                          : "text-white/40 group-hover:text-white"
                      }`}
                    />

                    <span>{item.label}</span>

                    {active && (
                      <span className="ml-auto h-2 w-2 rounded-full bg-cyan-400 shadow-lg shadow-cyan-400/50" />
                    )}
                  </Link>
                );
              })}
            </nav>

            <p className="mb-3 mt-8 px-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/30">
              Insights
            </p>

            <nav className="space-y-1">
              {secondaryItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);

                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all ${
                      active
                        ? "bg-white/10 text-white"
                        : "text-white/50 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <Icon className="h-5 w-5 text-white/40 group-hover:text-cyan-400" />

                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="mt-8 rounded-2xl border border-cyan-400/10 lg-gradient-to-br from-cyan-400/10 to-violet-500/10 p-4">
              <div className="mb-3 flex items-center gap-2">
                <Upload className="h-4 w-4 text-cyan-400" />

                <span className="text-sm font-semibold">
                  Analyze Data
                </span>
              </div>

              <p className="mb-4 text-xs leading-5 text-white/40">
                Upload a dataset and let OmniMind uncover patterns,
                risks, forecasts, and recommendations.
              </p>

              <Link
                href="/dashboard/datasets"
                className="flex items-center justify-center rounded-xl bg-white px-4 py-2.5 text-xs font-semibold text-black transition hover:bg-white/90"
              >
                Open datasets
              </Link>
            </div>
          </div>

          <div className="border-t border-white/10 p-4">
            <Link
              href="/dashboard"
              className="mb-1 flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-white/50 transition hover:bg-white/5 hover:text-white"
            >
              <Settings className="h-5 w-5" />
              Settings
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-white/50 transition hover:bg-red-500/10 hover:text-red-300"
            >
              <LogOut className="h-5 w-5" />
              Logout
            </button>
          </div>
        </aside>

        <main className="min-w-0 flex-1 lg:pl-72">
          <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-white/10 bg-[#050816]/90 px-4 backdrop-blur-xl lg:hidden">
            <Link
              href="/dashboard"
              className="flex items-center gap-2"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg lg-gradient-to-br from-cyan-400 to-violet-600">
                <Sparkles className="h-4 w-4" />
              </div>

              <div>
                <p className="text-sm font-bold">
                  OmniMind
                </p>

                <p className="text-[10px] text-white/40">
                  AI Intelligence
                </p>
              </div>
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg border border-white/10 p-2 text-white/50 transition hover:bg-white/5 hover:text-white"
              aria-label="Logout"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </header>

          <div className="min-h-screen">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}





