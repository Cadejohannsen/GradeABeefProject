"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Users,
  FileText,
  Star,
  Trophy,
  Wrench,
  ChevronRight,
  ImagePlus,
  X,
  TrendingUp,
  Calendar,
  BarChart3,
  Medal,
} from "lucide-react";

interface PlayerStat {
  id: string;
  name: string;
  number: number;
  position: string;
  height: string;
  weight: string;
  year: string;
  snaps: number;
  jobPct: number;
  techPct: number;
  finalPct: number;
}

interface GameInfo {
  id: string;
  opponent: string;
  weekNumber: number;
  date: string;
  snapCount: number;
}

interface DashboardData {
  playerCount: number;
  playerStats: PlayerStat[];
  games: GameInfo[];
  gameCount: number;
  teamJobAvg: number | null;
  teamTechAvg: number | null;
  teamFinalAvg: number | null;
  topJob: PlayerStat | null;
  topTech: PlayerStat | null;
  byJob: PlayerStat[];
  byTech: PlayerStat[];
  byFinal: PlayerStat[];
}

function pctBadge(pct: number | null, snaps?: number) {
  if (pct === null || pct === 0 || (snaps !== undefined && snaps === 0)) {
    return <span className="text-white/25 text-xs font-mono">—</span>;
  }
  if (pct >= 80) {
    return <span className="grade-badge-good">{pct}%</span>;
  }
  if (pct >= 60) {
    return <span className="grade-badge-mid">{pct}%</span>;
  }
  return <span className="grade-badge-low">{pct}%</span>;
}

function pctText(pct: number | null): string {
  if (pct === null || pct === 0) return "text-white/30";
  if (pct >= 80) return "text-emerald-400";
  if (pct >= 60) return "text-yellow-400";
  return "text-red-400";
}

function pctRowBg(pct: number | null): string {
  if (pct === null || pct === 0) return "";
  if (pct >= 80) return "bg-emerald-500/[0.04]";
  if (pct >= 60) return "bg-yellow-500/[0.04]";
  return "bg-red-500/[0.04]";
}

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const year = searchParams.get("year");

  if (!year) {
    router.push("/select-year");
    return null;
  }

  const [data, setData] = useState<DashboardData | null>(null);
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [bannerFit, setBannerFit] = useState<string>("cover");
  const [bannerPos, setBannerPos] = useState<string>("center");
  const [bannerHeight, setBannerHeight] = useState<number>(200);
  const fileRef = useRef<HTMLInputElement>(null);

  const [showEditor, setShowEditor] = useState(false);
  const [editorUrl, setEditorUrl] = useState<string | null>(null);
  const [editorFit, setEditorFit] = useState("cover");
  const [editorPos, setEditorPos] = useState("center");
  const [editorHeight, setEditorHeight] = useState(200);

  useEffect(() => {
    fetch(`/api/dashboard?year=${year}`)
      .then((r) => r.json())
      .then(setData)
      .catch(() => {});
    const saved = localStorage.getItem("dashboard-banner");
    const savedFit = localStorage.getItem("dashboard-banner-fit");
    const savedPos = localStorage.getItem("dashboard-banner-pos");
    const savedHeight = localStorage.getItem("dashboard-banner-height");
    if (saved) setBannerUrl(saved);
    if (savedFit) setBannerFit(savedFit);
    if (savedPos) setBannerPos(savedPos);
    if (savedHeight) setBannerHeight(parseInt(savedHeight));
  }, [year]);

  function openEditor() {
    setEditorUrl(bannerUrl);
    setEditorFit(bannerFit);
    setEditorPos(bannerPos);
    setEditorHeight(bannerHeight);
    setShowEditor(true);
  }

  function handleEditorFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setEditorUrl(reader.result as string);
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  function applyBanner() {
    if (editorUrl) {
      setBannerUrl(editorUrl);
      setBannerFit(editorFit);
      setBannerPos(editorPos);
      setBannerHeight(editorHeight);
      localStorage.setItem("dashboard-banner", editorUrl);
      localStorage.setItem("dashboard-banner-fit", editorFit);
      localStorage.setItem("dashboard-banner-pos", editorPos);
      localStorage.setItem("dashboard-banner-height", String(editorHeight));
    }
    setShowEditor(false);
  }

  function removeBanner() {
    setBannerUrl(null);
    setBannerFit("cover");
    setBannerPos("center");
    setBannerHeight(200);
    localStorage.removeItem("dashboard-banner");
    localStorage.removeItem("dashboard-banner-fit");
    localStorage.removeItem("dashboard-banner-pos");
    localStorage.removeItem("dashboard-banner-height");
    setShowEditor(false);
  }

  return (
    <div className="animate-fade-in">
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleEditorFile} />

      {/* Banner Editor Modal */}
      {showEditor && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowEditor(false)}
          />
          <div className="relative bg-[#141414] border border-white/[0.10] rounded-2xl shadow-modal w-full max-w-2xl mx-4 p-6 z-10 animate-slide-up">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-white text-base">Edit Banner</h2>
                <p className="text-[12px] text-white/35 mt-0.5 font-inter">Customize your dashboard header image</p>
              </div>
              <button
                onClick={() => setShowEditor(false)}
                className="w-8 h-8 rounded-lg bg-white/[0.05] hover:bg-white/[0.09] flex items-center justify-center text-white/40 hover:text-white transition-all duration-150"
              >
                <X size={16} />
              </button>
            </div>

            {/* Preview */}
            <div className="rounded-xl border border-white/[0.07] overflow-hidden mb-5 bg-black/30">
              {editorUrl ? (
                <img
                  src={editorUrl}
                  alt="Preview"
                  style={{
                    width: "100%",
                    height: `${editorHeight}px`,
                    objectFit: editorFit as React.CSSProperties["objectFit"],
                    objectPosition: editorPos,
                  }}
                />
              ) : (
                <div
                  className="flex items-center justify-center text-white/20 text-sm font-inter"
                  style={{ height: `${editorHeight}px` }}
                >
                  No image selected
                </div>
              )}
            </div>

            <div className="mb-5">
              <button onClick={() => fileRef.current?.click()} className="btn-primary">
                <ImagePlus size={15} />
                {editorUrl ? "Change Image" : "Upload Image"}
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-[11px] text-white/40 mb-2 font-inter font-medium uppercase tracking-wider">
                  Fit
                </label>
                <select
                  value={editorFit}
                  onChange={(e) => setEditorFit(e.target.value)}
                  className="select-field"
                >
                  <option value="cover">Cover</option>
                  <option value="contain">Contain</option>
                  <option value="fill">Stretch</option>
                  <option value="none">Original</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] text-white/40 mb-2 font-inter font-medium uppercase tracking-wider">
                  Position
                </label>
                <select
                  value={editorPos}
                  onChange={(e) => setEditorPos(e.target.value)}
                  className="select-field"
                >
                  <option value="center">Center</option>
                  <option value="top">Top</option>
                  <option value="bottom">Bottom</option>
                  <option value="left">Left</option>
                  <option value="right">Right</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] text-white/40 mb-2 font-inter font-medium uppercase tracking-wider">
                  Height: {editorHeight}px
                </label>
                <input
                  type="range"
                  min={100}
                  max={400}
                  step={8}
                  value={editorHeight}
                  onChange={(e) => setEditorHeight(parseInt(e.target.value))}
                  className="w-full accent-primary-400 mt-2 cursor-pointer"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/[0.06]">
              {bannerUrl && (
                <button
                  onClick={removeBanner}
                  className="btn-danger text-[12px] py-1.5"
                >
                  Remove Banner
                </button>
              )}
              <div className="flex gap-2.5 ml-auto">
                <button onClick={() => setShowEditor(false)} className="btn-ghost">
                  Cancel
                </button>
                <button onClick={applyBanner} disabled={!editorUrl} className="btn-primary">
                  Apply Banner
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Banner */}
      <div className="mb-7">
        <div
          onClick={openEditor}
          className="relative rounded-xl border border-white/[0.07] overflow-hidden cursor-pointer group"
        >
          {bannerUrl ? (
            <>
              <img
                src={bannerUrl}
                alt="Team banner"
                style={{
                  width: "100%",
                  height: `${bannerHeight}px`,
                  objectFit: bannerFit as React.CSSProperties["objectFit"],
                  objectPosition: bannerPos,
                }}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-200 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-2 bg-black/60 backdrop-blur-sm text-white text-[13px] font-medium font-inter px-4 py-2 rounded-lg border border-white/10">
                  <ImagePlus size={15} />
                  Edit Banner
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-7 py-7 pt-16">
                <h1 className="text-5xl font-bold text-white drop-shadow">{year} Season</h1>
                <p className="text-white/55 mt-1.5 text-[13px] font-inter">
                  Welcome back, Coach — here&apos;s your season overview.
                </p>
              </div>
            </>
          ) : (
            <div
              className="px-7 py-9 transition-colors duration-200 relative overflow-hidden"
              style={{
                background: "linear-gradient(135deg, rgb(var(--cp-900) / 0.6) 0%, rgb(var(--cp-800) / 0.3) 50%, transparent 100%)",
              }}
            >
              {/* Primary color top accent bar */}
              <div
                className="absolute top-0 left-0 right-0 h-[2px]"
                style={{ background: "linear-gradient(90deg, rgb(var(--cp-400) / 0.8), rgb(var(--cp-300) / 0.3), transparent)" }}
              />
              {/* Subtle primary glow in corner */}
              <div
                className="absolute top-0 left-0 w-64 h-32 pointer-events-none"
                style={{ background: "radial-gradient(ellipse at top left, rgb(var(--cp-500) / 0.12), transparent 70%)" }}
              />
              <div className="relative flex items-start justify-between">
                <div>
                  <h1 className="text-5xl font-bold text-white drop-shadow-sm">{year} Season</h1>
                  <p className="text-white/40 mt-2 text-[13px] font-inter">
                    Welcome back, Coach — here&apos;s your season overview.
                  </p>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 text-[12px] text-white/35 font-inter mt-1">
                  <ImagePlus size={13} />
                  Add banner
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-7">
        <div className="metric-card group">
          <div className="flex items-start justify-between mb-3">
            <p className="section-label">Players</p>
            <div className="w-7 h-7 rounded-lg bg-primary-500/10 flex items-center justify-center border border-primary-500/15 group-hover:bg-primary-500/15 transition-colors">
              <Users size={13} className="text-primary-300" />
            </div>
          </div>
          <p className="text-3xl font-bold text-white font-bebas leading-none">
            {data?.playerCount ?? "—"}
          </p>
          <p className="text-[11px] text-white/30 mt-1.5 font-inter">Active on roster</p>
        </div>

        <div className="metric-card group">
          <div className="flex items-start justify-between mb-3">
            <p className="section-label">Games</p>
            <div className="w-7 h-7 rounded-lg bg-primary-500/10 flex items-center justify-center border border-primary-500/15 group-hover:bg-primary-500/15 transition-colors">
              <Calendar size={13} className="text-primary-300" />
            </div>
          </div>
          <p className="text-3xl font-bold text-white font-bebas leading-none">
            {data?.gameCount ?? "—"}
          </p>
          <p className="text-[11px] text-white/30 mt-1.5 font-inter">Graded this season</p>
        </div>

        <div className="metric-card group">
          <div className="flex items-start justify-between mb-3">
            <p className="section-label">Team Avg</p>
            <div className="w-7 h-7 rounded-lg bg-primary-500/10 flex items-center justify-center border border-primary-500/15 group-hover:bg-primary-500/15 transition-colors">
              <BarChart3 size={13} className="text-primary-300" />
            </div>
          </div>
          <p className={`text-3xl font-bold font-bebas leading-none ${pctText(data?.teamFinalAvg ?? null)}`}>
            {data?.teamFinalAvg ? `${data.teamFinalAvg}%` : "—"}
          </p>
          <p className="text-[11px] text-white/30 mt-1.5 font-inter">Final grade average</p>
        </div>

        <div className="metric-card group">
          <div className="flex items-start justify-between mb-3">
            <p className="section-label">Top Performer</p>
            <div className="w-7 h-7 rounded-lg bg-primary-500/10 flex items-center justify-center border border-primary-500/15 group-hover:bg-primary-500/15 transition-colors">
              <Medal size={13} className="text-primary-300" />
            </div>
          </div>
          {data?.topJob ? (
            <>
              <p className="text-[15px] font-semibold text-white leading-tight font-inter truncate">
                #{data.topJob.number} {data.topJob.name}
              </p>
              <div className="mt-1.5">{pctBadge(data.topJob.finalPct)}</div>
            </>
          ) : (
            <p className="text-3xl font-bold text-white/25 font-bebas leading-none">—</p>
          )}
        </div>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* ROSTER CARD */}
        <Link href={`/dashboard/players?year=${year}`} className="block group">
          <div className="card-hover h-full">
            <div className="card-header">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-primary-500/10 border border-primary-500/15 flex items-center justify-center">
                  <Users size={13} className="text-primary-300" />
                </div>
                <span className="text-[13px] font-semibold text-white font-inter">Roster</span>
              </div>
              <div className="flex items-center gap-1.5 text-white/25 group-hover:text-white/50 transition-colors">
                <span className="text-[11px] font-mono">{data?.playerCount ?? 0}</span>
                <ChevronRight size={13} />
              </div>
            </div>
            <div>
              {data?.playerStats && data.playerStats.length > 0 ? (
                <table className="w-full font-inter">
                  <thead>
                    <tr className="bg-white/[0.02] border-b border-white/[0.05]">
                      <th className="text-left px-4 py-2.5 text-white/30">#</th>
                      <th className="text-left px-3 py-2.5 text-white/30">Name</th>
                      <th className="text-center px-2 py-2.5 text-white/30">Pos</th>
                      <th className="text-center px-2 py-2.5 text-white/30">Snaps</th>
                      <th className="text-center px-3 py-2.5 text-white/30">Grade</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {data.playerStats.map((p) => (
                      <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-4 py-2.5 font-mono text-white/40 text-xs">{p.number}</td>
                        <td className="px-3 py-2.5 text-white font-medium text-[13px] truncate max-w-[100px]">{p.name}</td>
                        <td className="text-center px-2 py-2.5">
                          <span className="text-[10px] font-semibold text-white/40 bg-white/[0.05] px-1.5 py-0.5 rounded font-mono">
                            {p.position}
                          </span>
                        </td>
                        <td className="text-center px-2 py-2.5 text-white/40 text-xs font-mono">{p.snaps || "—"}</td>
                        <td className="text-center px-3 py-2.5">
                          {pctBadge(p.snaps > 0 ? p.finalPct : null)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="px-5 py-10 text-center">
                  <Users size={24} className="text-white/10 mx-auto mb-2" />
                  <p className="text-[12px] text-white/25 font-inter">No players yet</p>
                </div>
              )}
            </div>
          </div>
        </Link>

        {/* GAMES CARD */}
        <Link href={`/dashboard/grades?year=${year}`} className="block group">
          <div className="card-hover h-full">
            <div className="card-header">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-primary-500/10 border border-primary-500/15 flex items-center justify-center">
                  <FileText size={13} className="text-primary-300" />
                </div>
                <span className="text-[13px] font-semibold text-white font-inter">Games</span>
              </div>
              <div className="flex items-center gap-1.5 text-white/25 group-hover:text-white/50 transition-colors">
                <span className="text-[11px] font-mono">{data?.gameCount ?? 0}</span>
                <ChevronRight size={13} />
              </div>
            </div>
            <div>
              {data?.games && data.games.length > 0 ? (
                <div className="divide-y divide-white/[0.04]">
                  {data.games.map((g) => (
                    <div
                      key={g.id}
                      className="flex items-center justify-between px-5 py-3.5 hover:bg-white/[0.02] transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[10px] font-semibold text-white/30 uppercase tracking-wider font-inter">
                            Wk {g.weekNumber}
                          </span>
                        </div>
                        <div className="text-[13px] font-medium text-white font-inter">vs {g.opponent}</div>
                        <div className="text-[11px] text-white/30 font-inter mt-0.5">
                          {new Date(g.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-white font-bebas leading-none">{g.snapCount}</div>
                        <div className="text-[10px] text-white/30 font-inter mt-0.5">snaps</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="px-5 py-10 text-center">
                  <Calendar size={24} className="text-white/10 mx-auto mb-2" />
                  <p className="text-[12px] text-white/25 font-inter">No games graded yet</p>
                </div>
              )}
            </div>
          </div>
        </Link>

        {/* TEAM GRADES CARD */}
        <Link href={`/dashboard/grades?year=${year}`} className="block group">
          <div className="card-hover h-full">
            <div className="card-header">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-primary-500/10 border border-primary-500/15 flex items-center justify-center">
                  <Star size={13} className="text-primary-300" />
                </div>
                <span className="text-[13px] font-semibold text-white font-inter">Team Grades</span>
              </div>
              <ChevronRight size={13} className="text-white/25 group-hover:text-white/50 transition-colors" />
            </div>

            {/* Team averages */}
            <div className="grid grid-cols-3 border-b border-white/[0.05]">
              {[
                { label: "Job", value: data?.teamJobAvg ?? null },
                { label: "Tech", value: data?.teamTechAvg ?? null },
                { label: "Final", value: data?.teamFinalAvg ?? null },
              ].map((metric, i) => (
                <div
                  key={metric.label}
                  className={`p-4 text-center ${i < 2 ? "border-r border-white/[0.04]" : ""}`}
                >
                  <div className="section-label mb-2">{metric.label} Avg</div>
                  <div className={`text-2xl font-bold font-bebas ${pctText(metric.value)}`}>
                    {metric.value ? `${metric.value}%` : "—"}
                  </div>
                </div>
              ))}
            </div>

            {/* Leaderboard */}
            <div>
              {data?.byFinal && data.byFinal.length > 0 ? (
                <table className="w-full font-inter">
                  <thead>
                    <tr className="bg-white/[0.02] border-b border-white/[0.05]">
                      <th className="text-left px-4 py-2.5 text-white/30">Player</th>
                      <th className="text-center px-2 py-2.5 text-white/30">Job</th>
                      <th className="text-center px-2 py-2.5 text-white/30">Tech</th>
                      <th className="text-center px-3 py-2.5 text-white/30">Final</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {data.byFinal.map((p, i) => (
                      <tr key={p.id} className={`hover:bg-white/[0.02] transition-colors ${pctRowBg(p.finalPct)}`}>
                        <td className="px-4 py-2.5">
                          <span className="text-[10px] text-white/25 mr-2 font-mono w-3 inline-block">{i + 1}</span>
                          <span className="text-[13px] font-semibold text-white">#{p.number}</span>
                          <span className="text-[12px] text-white/55 ml-1.5">{p.name}</span>
                        </td>
                        <td className="text-center px-2 py-2.5">{pctBadge(p.jobPct)}</td>
                        <td className="text-center px-2 py-2.5">{pctBadge(p.techPct)}</td>
                        <td className="text-center px-3 py-2.5">{pctBadge(p.finalPct)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="px-5 py-10 text-center">
                  <TrendingUp size={24} className="text-white/10 mx-auto mb-2" />
                  <p className="text-[12px] text-white/25 font-inter">No grades yet — start grading a game</p>
                </div>
              )}
            </div>
          </div>
        </Link>

        {/* JOB GRADE RANKINGS */}
        <Link href={`/dashboard/grades?year=${year}`} className="block group">
          <div className="card-hover h-full">
            <div className="card-header">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-primary-500/10 border border-primary-500/15 flex items-center justify-center">
                  <Trophy size={13} className="text-primary-300" />
                </div>
                <span className="text-[13px] font-semibold text-white font-inter">Job Rankings</span>
              </div>
              <ChevronRight size={13} className="text-white/25 group-hover:text-white/50 transition-colors" />
            </div>
            <div>
              {data?.byJob && data.byJob.length > 0 ? (
                <div className="divide-y divide-white/[0.04]">
                  {data.byJob.map((p, i) => (
                    <div
                      key={p.id}
                      className={`flex items-center justify-between px-5 py-3 hover:bg-white/[0.02] transition-colors ${pctRowBg(p.jobPct)}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-[11px] text-white/20 font-mono w-4 text-right flex-shrink-0">{i + 1}</span>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[13px] font-bold text-white font-inter">#{p.number}</span>
                            <span className="text-[12px] text-white/60 font-inter">{p.name}</span>
                            <span className="text-[10px] text-white/25 font-mono">{p.position}</span>
                          </div>
                          <div className="text-[10px] text-white/25 font-inter mt-0.5">{p.snaps} snaps</div>
                        </div>
                      </div>
                      {pctBadge(p.jobPct)}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="px-5 py-10 text-center">
                  <Trophy size={24} className="text-white/10 mx-auto mb-2" />
                  <p className="text-[12px] text-white/25 font-inter">No grades yet</p>
                </div>
              )}
            </div>
          </div>
        </Link>

        {/* TECH GRADE RANKINGS */}
        <Link href={`/dashboard/grades?year=${year}`} className="block group">
          <div className="card-hover h-full">
            <div className="card-header">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-primary-500/10 border border-primary-500/15 flex items-center justify-center">
                  <Wrench size={13} className="text-primary-300" />
                </div>
                <span className="text-[13px] font-semibold text-white font-inter">Tech Rankings</span>
              </div>
              <ChevronRight size={13} className="text-white/25 group-hover:text-white/50 transition-colors" />
            </div>
            <div>
              {data?.byTech && data.byTech.length > 0 ? (
                <div className="divide-y divide-white/[0.04]">
                  {data.byTech.map((p, i) => (
                    <div
                      key={p.id}
                      className={`flex items-center justify-between px-5 py-3 hover:bg-white/[0.02] transition-colors ${pctRowBg(p.techPct)}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-[11px] text-white/20 font-mono w-4 text-right flex-shrink-0">{i + 1}</span>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[13px] font-bold text-white font-inter">#{p.number}</span>
                            <span className="text-[12px] text-white/60 font-inter">{p.name}</span>
                            <span className="text-[10px] text-white/25 font-mono">{p.position}</span>
                          </div>
                          <div className="text-[10px] text-white/25 font-inter mt-0.5">{p.snaps} snaps</div>
                        </div>
                      </div>
                      {pctBadge(p.techPct)}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="px-5 py-10 text-center">
                  <Wrench size={24} className="text-white/10 mx-auto mb-2" />
                  <p className="text-[12px] text-white/25 font-inter">No grades yet</p>
                </div>
              )}
            </div>
          </div>
        </Link>

      </div>
    </div>
  );
}
