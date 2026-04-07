"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  const router = useRouter();
  const { data: session } = useSession();

  return (
    <aside className="fixed left-0 top-0 h-screen w-[200px] bg-[#111111] flex flex-col border-r border-white/[0.08] z-50">
      <div className="p-5 border-b border-white/[0.08]">
        <h1 className="text-base font-bold text-primary-300 tracking-tight">
          Grade-A-Beef
        </h1>
        <p className="text-[10px] text-white/40 uppercase tracking-widest mt-0.5">Lineman Tracker</p>
      </div>

      <nav className="flex-1 py-4 space-y-0.5 px-3">
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
                "flex items-center gap-3 px-3 py-2 rounded text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-white/[0.06] text-white border-l-2 border-primary-400"
                  : "text-white/50 hover:bg-primary-500/10 hover:text-white/80"
              )}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/[0.08]">
        <div className="flex items-center gap-2.5 px-1 py-2">
          <div className="w-8 h-8 rounded bg-primary-700 flex items-center justify-center">
            <User size={14} className="text-primary-200" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-white/80 truncate">
              {session?.user?.name || "Coach"}
            </p>
            <p className="text-[10px] text-white/30 truncate">
              {session?.user?.email || ""}
            </p>
          </div>
        </div>
        <button
          onClick={async () => { await signOut({ redirect: false }); router.push("/login"); }}
          className="flex items-center gap-2 w-full px-3 py-2 mt-1 text-xs text-white/40 hover:text-red-400 rounded hover:bg-white/[0.06] transition-colors duration-150"
        >
          <LogOut size={14} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
