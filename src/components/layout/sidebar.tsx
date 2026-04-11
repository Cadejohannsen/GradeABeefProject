"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Users,
  Star,
  Zap,
  Shield,
  Shuffle,
  LogOut,
  Settings,
  Sparkles,
  ChevronDown,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSettings } from "@/components/providers/settings-provider";

const navGroups = [
  {
    label: "Overview",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
    ],
  },
  {
    label: "Analytics",
    items: [
      { href: "/dashboard/players", label: "Players", icon: Users, exact: false },
      { href: "/dashboard/grades", label: "Grades", icon: Star, exact: false },
    ],
  },
  {
    label: "Playbook",
    items: [
      { href: "/dashboard/runs", label: "Run Game", icon: Zap, exact: false },
      { href: "/dashboard/pass", label: "Pass Pro", icon: Shield, exact: false },
      { href: "/dashboard/draws-screens", label: "Draw & Screen", icon: Shuffle, exact: false },
    ],
  },
  {
    label: "Tools",
    items: [
      { href: "/dashboard/ai", label: "AI Assistant", icon: Sparkles, exact: false },
      { href: "/dashboard/settings", label: "Settings", icon: Settings, exact: false },
    ],
  },
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 10 }, (_, i) => String(currentYear - i));

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const year = searchParams.get("year");
  const { data: session } = useSession();
  const { settings } = useSettings();

  const [yearOpen, setYearOpen] = useState(false);
  const [switching, setSwitching] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setYearOpen(false);
      }
    }
    if (yearOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [yearOpen]);

  const withYear = (href: string) => (year ? `${href}?year=${year}` : href);

  const isActive = (href: string, exact: boolean) => {
    if (exact) return pathname === href;
    return pathname === href || pathname?.startsWith(href + "/") || pathname?.startsWith(href);
  };

  async function switchYear(newYear: string) {
    if (newYear === year || switching) return;
    setSwitching(true);
    setYearOpen(false);
    try {
      await fetch("/api/seasons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ year: newYear }),
      });
    } catch (_) {}
    // Navigate to current page (or dashboard) with the new year
    const dest = pathname.startsWith("/dashboard") ? pathname : "/dashboard";
    router.push(`${dest}?year=${newYear}`);
    setSwitching(false);
  }

  const initials = (session?.user?.name || "C")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <aside className="fixed left-0 top-0 h-screen w-[240px] bg-sidebar flex flex-col border-r border-white/[0.06] z-50">

      {/* Brand header */}
      <div className="px-4 pt-5 pb-4 border-b border-white/[0.06] relative">
        {/* Primary color accent bar */}
        <div
          className="absolute top-0 left-0 right-0 h-[2px] rounded-t"
          style={{ background: "linear-gradient(90deg, rgb(var(--cp-400) / 0.7), rgb(var(--cp-300) / 0.3), transparent)" }}
        />
        {/* Team identity */}
        <div className="flex items-center gap-3 px-2 py-1">
          {settings.logoDataUrl ? (
            <img
              src={settings.logoDataUrl}
              alt="Team logo"
              className="w-8 h-8 object-contain rounded-md flex-shrink-0"
            />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-primary-700/60 flex items-center justify-center flex-shrink-0 border border-primary-600/30">
              <span className="text-sm font-bold text-primary-200 font-bebas tracking-wide">G</span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-white/90 truncate leading-tight font-inter tracking-tight">
              {settings.teamName || "Grade-A-Beef"}
            </p>
            <p className="text-[10px] text-white/30 leading-tight mt-0.5 font-inter">Lineman Tracker</p>
          </div>
        </div>

        {/* Season year dropdown */}
        {year && (
          <div className="relative mt-3 ml-2" ref={dropdownRef}>
            <button
              onClick={() => setYearOpen((o) => !o)}
              className={cn(
                "inline-flex items-center gap-1.5 text-[11px] font-medium transition-all duration-150 font-inter group px-2 py-1 rounded-md -ml-2",
                yearOpen
                  ? "bg-primary-500/10 text-primary-200"
                  : "text-primary-300/70 hover:text-primary-200 hover:bg-primary-500/8"
              )}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-primary-400/60 flex-shrink-0" />
              <span>{switching ? "Switching…" : `${year} Season`}</span>
              <ChevronDown
                size={11}
                className={cn("transition-transform duration-150 ml-0.5", yearOpen ? "rotate-180" : "")}
              />
            </button>

            {yearOpen && (
              <div className="absolute left-0 top-full mt-1.5 w-44 rounded-xl border border-white/[0.10] shadow-modal overflow-hidden z-50 animate-slide-up"
                style={{ background: "rgb(var(--ui-surface))" }}
              >
                <div className="px-3 py-2 border-b border-white/[0.06]">
                  <p className="text-[10px] font-semibold text-white/30 uppercase tracking-wider font-inter">
                    Switch Season
                  </p>
                </div>
                <div className="py-1 max-h-56 overflow-y-auto">
                  {YEARS.map((y) => {
                    const active = y === year;
                    return (
                      <button
                        key={y}
                        onClick={() => switchYear(y)}
                        className={cn(
                          "w-full flex items-center justify-between px-3 py-2 text-[13px] font-inter transition-colors duration-100",
                          active
                            ? "text-primary-200 bg-primary-500/10"
                            : "text-white/60 hover:bg-white/[0.05] hover:text-white/90"
                        )}
                      >
                        <span>{y} Season</span>
                        {active && <Check size={13} className="text-primary-300 flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="section-label px-3 mb-1.5">{group.label}</p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = isActive(item.href, item.exact);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={withYear(item.href)}
                    className={cn(
                      "flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-all duration-150 font-inter relative",
                      active
                        ? "bg-primary-500/10 text-white font-medium border border-primary-500/15"
                        : "text-white/40 hover:bg-white/[0.04] hover:text-white/70 font-normal border border-transparent"
                    )}
                  >
                    {active && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-primary-400" />
                    )}
                    <Icon
                      size={15}
                      className={cn(
                        "flex-shrink-0 transition-colors",
                        active ? "text-primary-300" : "text-white/30"
                      )}
                    />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User section */}
      <div className="p-3 border-t border-white/[0.06]">
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-white/[0.04] transition-colors duration-150 cursor-default">
          {settings.logoDataUrl ? (
            <img
              src={settings.logoDataUrl}
              alt="Team logo"
              className="w-7 h-7 rounded-md object-contain bg-white/[0.04] flex-shrink-0 border border-white/[0.07]"
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-primary-800/80 flex items-center justify-center flex-shrink-0 border border-primary-700/40">
              <span className="text-[10px] font-semibold text-primary-200 font-inter">{initials}</span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-medium text-white/75 truncate font-inter leading-tight">
              {session?.user?.name || "Coach"}
            </p>
            <p className="text-[10px] text-white/30 truncate font-inter leading-tight mt-0.5">
              {session?.user?.email || ""}
            </p>
          </div>
        </div>
        <button
          onClick={async () => {
            await signOut({ redirect: false });
            router.push("/login");
          }}
          className="flex items-center gap-2 w-full px-3 py-1.5 mt-0.5 text-[11px] text-white/30 hover:text-red-400 rounded-lg hover:bg-red-500/[0.06] transition-all duration-150 font-inter"
        >
          <LogOut size={12} />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
}
