"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Users, FileText, Star, Trophy, Wrench, ChevronRight } from "lucide-react";

interface Player {
  id: string;
  name: string;
  number: number;
  position: string;
  snaps?: number;
  jobPct?: number;
  techPct?: number;
  finalPct?: number;
}

interface DashboardData {
  playerCount: number;
  players: Player[];
  gameCount: number;
  recentGame: { id: string; opponent: string; weekNumber: number; date: string } | null;
  teamJobAvg: number | null;
  teamTechAvg: number | null;
  teamFinalAvg: number | null;
  topJob: Player | null;
  topTech: Player | null;
}

function pctColor(v: number | null) {
  if (v === null) return "text-white/30";
  if (v >= 80) return "text-green-400";
  if (v >= 60) return "text-yellow-400";
  return "text-red-400";
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    fetch("/api/dashboard").then((r) => r.json()).then(setData);
  }, []);

  const d = data;

  return (
    <div>
      <div className="mb-8">
        <div className="backdrop-blur-md bg-white/[0.04] rounded-2xl p-6 border border-primary-500/30">
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-white/40 mt-1">Welcome back, Coach. Here&apos;s your team overview.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">

        {/* ROSTER CARD */}
        <Link href="/dashboard/players">
          <div className="group relative backdrop-blur-md bg-white/[0.04] rounded-2xl border border-white/10 hover:border-primary-400/40 p-5 transition-all duration-200 hover:shadow-lg hover:shadow-primary-500/10 cursor-pointer h-full">
            <div className="flex items-start justify-between mb-4">
              <div className="p-2.5 rounded-lg bg-primary-500/15 text-primary-300"><Users size={22} /></div>
              <ChevronRight size={16} className="text-white/20 group-hover:text-primary-400 transition-colors" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">Roster</h3>
            <p className="text-xs text-white/40 mb-4">View and manage your linemen</p>
            <div className="border-t border-white/10 pt-3">
              <span className="text-xs text-white/30">Total Players</span>
              <p className="text-2xl font-bold text-white">{d ? d.playerCount : "--"}</p>
              {d && d.players.length > 0 && (
                <div className="mt-2 space-y-1">
                  {d.players.slice(0, 4).map((p) => (
                    <div key={p.id} className="flex items-center gap-1.5">
                      <span className="text-xs text-primary-400 font-mono w-5 text-right">#{p.number}</span>
                      <span className="text-xs text-white/60 truncate">{p.name}</span>
                      <span className="text-xs text-white/30 ml-auto">{p.position}</span>
                    </div>
                  ))}
                  {d.playerCount > 4 && (
                    <p className="text-xs text-white/30 mt-1">+{d.playerCount - 4} more</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </Link>

        {/* GAME REPORT CARD */}
        <Link href="/dashboard/grades">
          <div className="group relative backdrop-blur-md bg-white/[0.04] rounded-2xl border border-white/10 hover:border-primary-400/40 p-5 transition-all duration-200 hover:shadow-lg hover:shadow-primary-500/10 cursor-pointer h-full">
            <div className="flex items-start justify-between mb-4">
              <div className="p-2.5 rounded-lg bg-primary-500/15 text-primary-300"><FileText size={22} /></div>
              <ChevronRight size={16} className="text-white/20 group-hover:text-primary-400 transition-colors" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">Game Report</h3>
            <p className="text-xs text-white/40 mb-4">Latest game breakdowns</p>
            <div className="border-t border-white/10 pt-3">
              <span className="text-xs text-white/30">Games Graded</span>
              <p className="text-2xl font-bold text-white">{d ? d.gameCount : "--"}</p>
              {d?.recentGame ? (
                <div className="mt-2">
                  <p className="text-xs text-white/30">Most Recent</p>
                  <p className="text-sm font-semibold text-white">vs {d.recentGame.opponent}</p>
                  <p className="text-xs text-white/40">
                    Game {d.recentGame.weekNumber} · {new Date(d.recentGame.date).toLocaleDateString()}
                  </p>
                </div>
              ) : d ? (
                <p className="text-xs text-white/30 mt-2">No games yet</p>
              ) : null}
            </div>
          </div>
        </Link>

        {/* T-GRADE CARD */}
        <Link href="/dashboard/grades">
          <div className="group relative backdrop-blur-md bg-white/[0.04] rounded-2xl border border-white/10 hover:border-primary-400/40 p-5 transition-all duration-200 hover:shadow-lg hover:shadow-primary-500/10 cursor-pointer h-full">
            <div className="flex items-start justify-between mb-4">
              <div className="p-2.5 rounded-lg bg-primary-500/15 text-primary-300"><Star size={22} /></div>
              <ChevronRight size={16} className="text-white/20 group-hover:text-primary-400 transition-colors" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">T-Grade</h3>
            <p className="text-xs text-white/40 mb-4">Team-wide grade averages</p>
            <div className="border-t border-white/10 pt-3">
              <span className="text-xs text-white/30">Team Final %</span>
              <p className={`text-2xl font-bold ${pctColor(d?.teamFinalAvg ?? null)}`}>
                {d ? (d.teamFinalAvg !== null ? `${d.teamFinalAvg}%` : "—") : "--"}
              </p>
              {d && (
                <div className="mt-2 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-xs text-white/40">Job</span>
                    <span className={`text-xs font-bold ${pctColor(d.teamJobAvg)}`}>
                      {d.teamJobAvg !== null ? `${d.teamJobAvg}%` : "—"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-white/40">Tech</span>
                    <span className={`text-xs font-bold ${pctColor(d.teamTechAvg)}`}>
                      {d.teamTechAvg !== null ? `${d.teamTechAvg}%` : "—"}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Link>

        {/* TOP JOB CARD */}
        <Link href="/dashboard/grades">
          <div className="group relative backdrop-blur-md bg-white/[0.04] rounded-2xl border border-white/10 hover:border-primary-400/40 p-5 transition-all duration-200 hover:shadow-lg hover:shadow-primary-500/10 cursor-pointer h-full">
            <div className="flex items-start justify-between mb-4">
              <div className="p-2.5 rounded-lg bg-primary-500/15 text-primary-300"><Trophy size={22} /></div>
              <ChevronRight size={16} className="text-white/20 group-hover:text-primary-400 transition-colors" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">Top Job</h3>
            <p className="text-xs text-white/40 mb-4">Best assignment grade</p>
            <div className="border-t border-white/10 pt-3">
              {d?.topJob ? (
                <>
                  <span className="text-xs text-white/30">Leader</span>
                  <p className="text-lg font-bold text-white leading-tight">{d.topJob.name}</p>
                  <p className="text-xs text-white/40">{d.topJob.position} #{d.topJob.number}</p>
                  <p className={`text-2xl font-bold mt-1 ${pctColor(d.topJob.jobPct ?? null)}`}>
                    {d.topJob.jobPct}%
                  </p>
                  <p className="text-xs text-white/30">{d.topJob.snaps} snaps</p>
                </>
              ) : (
                <>
                  <span className="text-xs text-white/30">Top Player</span>
                  <p className="text-2xl font-bold text-white/30">—</p>
                  <p className="text-xs text-white/20 mt-1">No grades yet</p>
                </>
              )}
            </div>
          </div>
        </Link>

        {/* TOP TECH CARD */}
        <Link href="/dashboard/grades">
          <div className="group relative backdrop-blur-md bg-white/[0.04] rounded-2xl border border-white/10 hover:border-primary-400/40 p-5 transition-all duration-200 hover:shadow-lg hover:shadow-primary-500/10 cursor-pointer h-full">
            <div className="flex items-start justify-between mb-4">
              <div className="p-2.5 rounded-lg bg-primary-500/15 text-primary-300"><Wrench size={22} /></div>
              <ChevronRight size={16} className="text-white/20 group-hover:text-primary-400 transition-colors" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">Top Tech</h3>
            <p className="text-xs text-white/40 mb-4">Best technique grade</p>
            <div className="border-t border-white/10 pt-3">
              {d?.topTech ? (
                <>
                  <span className="text-xs text-white/30">Leader</span>
                  <p className="text-lg font-bold text-white leading-tight">{d.topTech.name}</p>
                  <p className="text-xs text-white/40">{d.topTech.position} #{d.topTech.number}</p>
                  <p className={`text-2xl font-bold mt-1 ${pctColor(d.topTech.techPct ?? null)}`}>
                    {d.topTech.techPct}%
                  </p>
                  <p className="text-xs text-white/30">{d.topTech.snaps} snaps</p>
                </>
              ) : (
                <>
                  <span className="text-xs text-white/30">Top Tech</span>
                  <p className="text-2xl font-bold text-white/30">—</p>
                  <p className="text-xs text-white/20 mt-1">No grades yet</p>
                </>
              )}
            </div>
          </div>
        </Link>

      </div>
    </div>
  );
}
