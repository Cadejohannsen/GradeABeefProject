"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Users,
  Star,
  Zap,
  Shield,
  Shuffle,
  LogOut,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dash", icon: LayoutDashboard },
  { href: "/dashboard/players", label: "Players", icon: Users },
  { href: "/dashboard/grades", label: "Grades", icon: Star },
  { href: "/dashboard/runs", label: "Runs", icon: Zap },
  { href: "/dashboard/pass", label: "Pass", icon: Shield },
  { href: "/dashboard/draws-screens", label: "Draw/Screen", icon: Shuffle },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <aside className="fixed left-0 top-0 h-screen w-[180px] bg-sidebar flex flex-col border-r border-border z-50">
      <div className="p-4 border-b border-border">
        <h1 className="text-lg font-bold text-primary-400 tracking-tight">
          🥩 GradeABeef
        </h1>
      </div>

      <nav className="flex-1 py-4 space-y-1 px-2">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname?.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all",
                isActive
                  ? "bg-primary-500/20 text-primary-400 border-l-2 border-primary-500"
                  : "text-sidebar-foreground hover:bg-sidebar-hover hover:text-white"
              )}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-border">
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="w-8 h-8 rounded-full bg-primary-700 flex items-center justify-center">
            <User size={16} className="text-primary-200" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-sidebar-foreground truncate">
              {session?.user?.name || "Coach"}
            </p>
            <p className="text-[10px] text-muted-foreground truncate">
              {session?.user?.email || ""}
            </p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-2 w-full px-3 py-2 mt-1 text-xs text-muted-foreground hover:text-accent-500 rounded-md hover:bg-accent/10 transition-colors"
        >
          <LogOut size={14} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
