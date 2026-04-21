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

const navItems = [
  { href: "/dashboard",              label: "Dashboard",    icon: LayoutDashboard, exact: true  },
  { href: "/dashboard/players",      label: "Players",      icon: Users,           exact: false },
  { href: "/dashboard/grades",       label: "Grades",       icon: Star,            exact: false },
  { href: "/dashboard/runs",         label: "Run Game",     icon: Zap,             exact: false },
  { href: "/dashboard/pass",         label: "Pass Pro",     icon: Shield,          exact: false },
  { href: "/dashboard/draws-screens",label: "Screens",      icon: Shuffle,         exact: false },
  { href: "/dashboard/ai",           label: "AI",           icon: Sparkles,        exact: false },
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 10 }, (_, i) => String(currentYear - i));

export function TopNav() {
  const pathname   = usePathname();
  const router     = useRouter();
  const searchParams = useSearchParams();
  const year       = searchParams.get("year");
  const { data: session } = useSession();
  const { settings } = useSettings();

  const [yearOpen,   setYearOpen]   = useState(false);
  const [userOpen,   setUserOpen]   = useState(false);
  const [switching,  setSwitching]  = useState(false);
  const yearRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (yearRef.current && !yearRef.current.contains(e.target as Node)) setYearOpen(false);
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

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
    <header
      className="fixed top-0 left-0 right-0 z-50 flex flex-col"
      style={{ height: "var(--topnav-h)" }}
    >
      {/* F1-style red accent line at very top */}
      <div
        className="w-full flex-shrink-0"
        style={{
          height: "3px",
          background: "linear-gradient(90deg, rgb(var(--cp-500)) 0%, rgb(var(--cp-400) / 0.6) 60%, transparent 100%)",
        }}
      />

      {/* Main nav bar */}
      <div
        className="flex-1 flex items-stretch px-5 gap-0"
        style={{
          background: "rgb(8 8 8 / 1)",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        {/* ── Brand (left) ── */}
        <div className="relative flex items-center pr-6 border-r border-white/[0.07] mr-4 flex-shrink-0" style={{ paddingLeft: "98px" }}>
          {/* Logo — absolutely positioned so it never shifts the text */}
          {settings.logoDataUrl ? (
            <img
              src={settings.logoDataUrl}
              alt="Team logo"
              className="absolute object-contain"
              style={{ left: 0, top: "50%", transform: "translateY(-50%)", width: "90px", height: "90px" }}
            />
          ) : (
            <div
              className="absolute rounded flex items-center justify-center border"
              style={{
                left: 0, top: "50%", transform: "translateY(-50%)",
                width: "90px", height: "90px",
                background: "rgb(var(--cp-500) / 0.15)",
                borderColor: "rgb(var(--cp-500) / 0.30)",
              }}
            >
              <span className="text-xl font-bold font-bebas" style={{ color: "rgb(var(--cp-300))" }}>G</span>
            </div>
          )}
          {/* Text — always at the same position */}
          <div className="flex flex-col leading-none gap-1">
            <span
              className="font-bebas tracking-wide leading-none force-white"
              style={{ fontSize: "1.35rem", letterSpacing: "0.08em" }}
            >
              {settings.teamName || "Grade‑A‑Beef"}
            </span>
            <span
              className="font-inter font-semibold uppercase"
              style={{ fontSize: "0.65rem", letterSpacing: "0.15em", color: "rgb(var(--cp-400))" }}
            >
              Lineman Tracker
            </span>
          </div>
        </div>

        {/* ── Nav items (center-left) ── */}
        <nav className="flex items-stretch gap-1 flex-1 overflow-x-auto scrollbar-none">
          {navItems.map((item) => {
            const active = isActive(item.href, item.exact);
            const Icon   = item.icon;
            return (
              <Link
                key={item.href}
                href={withYear(item.href)}
                className={cn("topnav-link px-4", active && "active")}
              >
                <Icon size={12} className="flex-shrink-0 opacity-70" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* ── Right controls ── */}
        <div className="flex items-center gap-2 pl-4 flex-shrink-0">

          {/* Year selector */}
          {year && (
            <div className="relative" ref={yearRef}>
              <button
                onClick={() => setYearOpen((o) => !o)}
                className={cn(
                  "inline-flex items-center gap-1.5 font-inter font-semibold uppercase transition-all duration-150 px-3 py-1.5 rounded border",
                  yearOpen
                    ? "text-white border-white/20 bg-white/[0.10]"
                    : "text-white/80 border-white/[0.10] bg-white/[0.07] hover:text-white hover:bg-white/[0.10] hover:border-white/20"
                )}
                style={{ fontSize: "0.65rem", letterSpacing: "0.08em" }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ background: "rgb(var(--cp-500))" }}
                />
                {switching ? "…" : `${year} Season`}
                <ChevronDown
                  size={10}
                  className={cn("transition-transform duration-150", yearOpen ? "rotate-180" : "")}
                />
              </button>

              {yearOpen && (
                <div
                  className="absolute right-0 top-full mt-2 w-44 rounded border border-white/[0.10] shadow-modal overflow-hidden z-50 animate-slide-up"
                  style={{ background: "rgb(14 14 14)" }}
                >
                  <div className="px-3 py-2 border-b border-white/[0.07]">
                    <p className="text-[10px] font-semibold text-white/30 uppercase tracking-wider font-inter">
                      Switch Season
                    </p>
                  </div>
                  <div className="py-1 max-h-52 overflow-y-auto">
                    {YEARS.map((y) => {
                      const active = y === year;
                      return (
                        <button
                          key={y}
                          onClick={() => switchYear(y)}
                          className={cn(
                            "w-full flex items-center justify-between px-3 py-2 text-[13px] font-inter transition-colors duration-100",
                            active
                              ? "bg-white/[0.06] text-white"
                              : "text-white/50 hover:bg-white/[0.04] hover:text-white/80"
                          )}
                        >
                          <span>{y} Season</span>
                          {active && (
                            <Check size={12} style={{ color: "rgb(var(--cp-400))" }} className="flex-shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* User avatar + dropdown */}
          <div className="relative" ref={userRef}>
            <button
              onClick={() => setUserOpen((o) => !o)}
              className={cn(
                "flex items-center gap-2 px-2 py-1.5 rounded border transition-all duration-150",
                userOpen
                  ? "border-white/20 bg-white/[0.10]"
                  : "border-white/[0.10] bg-white/[0.07] hover:bg-white/[0.10] hover:border-white/20"
              )}
            >
              {settings.logoDataUrl ? (
                <img
                  src={settings.logoDataUrl}
                  alt="User"
                  className="w-6 h-6 rounded object-contain bg-white/[0.04] border border-white/[0.08] flex-shrink-0"
                />
              ) : (
                <div
                  className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0 border"
                  style={{
                    background: "rgb(var(--cp-500) / 0.18)",
                    borderColor: "rgb(var(--cp-500) / 0.30)",
                  }}
                >
                  <span className="text-[10px] font-bold font-inter text-white">{initials}</span>
                </div>
              )}
              <span
                className="font-inter font-medium text-white/60 max-w-[80px] truncate"
                style={{ fontSize: "0.75rem" }}
              >
                {session?.user?.name?.split(" ")[0] || "Coach"}
              </span>
              <ChevronDown
                size={10}
                className={cn("text-white/30 transition-transform duration-150", userOpen ? "rotate-180" : "")}
              />
            </button>

            {userOpen && (
              <div
                className="absolute right-0 top-full mt-2 w-52 rounded shadow-modal overflow-hidden z-50 animate-slide-up"
                style={{ background: "#1e1e1e", border: "1px solid rgba(255,255,255,0.12)" }}
              >
                {/* User info header */}
                <div className="px-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                  <p className="font-semibold font-inter leading-tight truncate" style={{ fontSize: "13px", color: "#ffffff" }}>
                    {session?.user?.name || "Coach"}
                  </p>
                  <p className="font-inter mt-0.5 truncate" style={{ fontSize: "11px", color: "rgba(255,255,255,0.45)" }}>
                    {session?.user?.email || ""}
                  </p>
                </div>
                <div className="py-1.5 px-2">
                  <Link
                    href={withYear("/dashboard/settings")}
                    onClick={() => setUserOpen(false)}
                    className="flex items-center gap-2.5 w-full px-3 py-2 rounded transition-colors duration-100 font-inter hover:bg-white/[0.08]"
                    style={{ fontSize: "12px", color: "rgba(255,255,255,0.65)" }}
                  >
                    <Settings size={13} />
                    Settings
                  </Link>
                  <button
                    onClick={async () => {
                      setUserOpen(false);
                      await signOut({ redirect: false });
                      router.push("/login");
                    }}
                    className="flex items-center gap-2.5 w-full px-3 py-2 rounded transition-colors duration-100 font-inter mt-0.5 hover:bg-red-500/[0.12] hover:text-red-400"
                    style={{ fontSize: "12px", color: "rgba(255,255,255,0.45)" }}
                  >
                    <LogOut size={13} />
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
