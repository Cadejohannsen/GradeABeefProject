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
  },
  {
    title: "Game Report",
    description: "Latest game breakdowns",
    icon: FileText,
    href: "/dashboard/grades",
    stat: "Games",
  },
  {
    title: "T-Grade",
    description: "Team-wide grade averages",
    icon: Star,
    href: "/dashboard/grades",
    stat: "Avg Grade",
  },
  {
    title: "Top Job",
    description: "Best graded performers",
    icon: Trophy,
    href: "/dashboard/grades",
    stat: "Top Player",
  },
  {
    title: "Top Tech",
    description: "Best technique grades",
    icon: Wrench,
    href: "/dashboard/grades",
    stat: "Top Tech",
  },
];

export default function DashboardPage() {
  return (
    <div>
      <div className="mb-8">
        <div className="backdrop-blur-md bg-white/[0.04] rounded-2xl p-6 border border-primary-500/30">
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-white/40 mt-1">
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
                className="group relative backdrop-blur-md bg-white/[0.04] rounded-2xl border border-white/10 hover:border-primary-400/40 p-5 transition-all duration-200 hover:shadow-lg hover:shadow-primary-500/10 cursor-pointer h-full"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-2.5 rounded-lg bg-primary-500/15 text-primary-300">
                    <Icon size={22} />
                  </div>
                  <ChevronRight
                    size={16}
                    className="text-white/20 group-hover:text-primary-400 transition-colors"
                  />
                </div>

                <h3 className="text-lg font-semibold text-white mb-1">
                  {card.title}
                </h3>
                <p className="text-xs text-white/40">
                  {card.description}
                </p>

                <div className="mt-4 pt-3 border-t border-white/10">
                  <span className="text-xs text-white/30">
                    {card.stat}
                  </span>
                  <p className="text-xl font-bold text-white">--</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
