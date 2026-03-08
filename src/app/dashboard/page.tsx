"use client";

import Link from "next/link";
import {
  Users,
  FileText,
  Star,
  Trophy,
  Wrench,
  ChevronRight,
} from "lucide-react";

const dashboardCards = [
  {
    title: "Roster",
    description: "View and manage your linemen",
    icon: Users,
    href: "/dashboard/players",
    stat: "Players",
    color: "border-primary-500/40 hover:border-primary-500",
    iconColor: "text-primary-400",
    bgGlow: "bg-primary-500/5",
  },
  {
    title: "Game Report",
    description: "Latest game breakdowns",
    icon: FileText,
    href: "/dashboard/grades",
    stat: "Games",
    color: "border-accent-600/40 hover:border-accent-500",
    iconColor: "text-accent-500",
    bgGlow: "bg-accent/5",
  },
  {
    title: "T-Grade",
    description: "Team-wide grade averages",
    icon: Star,
    href: "/dashboard/grades",
    stat: "Avg Grade",
    color: "border-yellow-500/40 hover:border-yellow-400",
    iconColor: "text-yellow-400",
    bgGlow: "bg-yellow-500/5",
  },
  {
    title: "Top Job",
    description: "Best graded performers",
    icon: Trophy,
    href: "/dashboard/grades",
    stat: "Top Player",
    color: "border-green-500/40 hover:border-green-400",
    iconColor: "text-green-400",
    bgGlow: "bg-green-500/5",
  },
  {
    title: "Top Tech",
    description: "Best technique grades",
    icon: Wrench,
    href: "/dashboard/grades",
    stat: "Top Tech",
    color: "border-cyan-500/40 hover:border-cyan-400",
    iconColor: "text-cyan-400",
    bgGlow: "bg-cyan-500/5",
  },
];

export default function DashboardPage() {
  return (
    <div>
      <div className="mb-8">
        <div className="bg-gradient-to-r from-primary-900/60 via-primary-800/40 to-background rounded-xl p-6 border border-primary-800/30">
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, Coach. Here&apos;s your team overview.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {dashboardCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.title} href={card.href}>
              <div
                className={`group relative bg-card rounded-xl border ${card.color} p-5 transition-all duration-200 hover:shadow-lg hover:shadow-primary-500/5 cursor-pointer h-full ${card.bgGlow}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`p-2.5 rounded-lg bg-muted ${card.iconColor}`}
                  >
                    <Icon size={22} />
                  </div>
                  <ChevronRight
                    size={16}
                    className="text-muted-foreground group-hover:text-foreground transition-colors"
                  />
                </div>

                <h3 className="text-lg font-semibold text-foreground mb-1">
                  {card.title}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {card.description}
                </p>

                <div className="mt-4 pt-3 border-t border-border">
                  <span className="text-xs text-muted-foreground">
                    {card.stat}
                  </span>
                  <p className="text-xl font-bold text-foreground">--</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
