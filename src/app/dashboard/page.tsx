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

function pctColor(pct: number | null): string {
  if (pct === null || pct === 0) return "text-white/30";
  if (pct >= 80) return "text-green-400";
  if (pct >= 60) return "text-yellow-400";
  return "text-red-500";
}

function pctBg(pct: number | null): string {
  if (pct === null || pct === 0) return "";
  if (pct >= 80) return "bg-green-500/10";
  if (pct >= 60) return "bg-yellow-500/10";
  return "bg-red-500/10";
}

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const year = searchParams.get("year");
  
  // If no year is provided, redirect to select-year page
  if (!year) {
    router.push("/select-year");
    return null;
  }
  
  const [data, setData] = useState<DashboardData | null>(null);
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [bannerFit, setBannerFit] = useState<string>("cover");
  const [bannerPos, setBannerPos] = useState<string>("center");
  const [bannerHeight, setBannerHeight] = useState<number>(192);
  const fileRef = useRef<HTMLInputElement>(null);

  // Editor modal state
  const [showEditor, setShowEditor] = useState(false);
  const [editorUrl, setEditorUrl] = useState<string | null>(null);
  const [editorFit, setEditorFit] = useState("cover");
  const [editorPos, setEditorPos] = useState("center");
  const [editorHeight, setEditorHeight] = useState(192);

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
    setBannerHeight(192);
    localStorage.removeItem("dashboard-banner");
    localStorage.removeItem("dashboard-banner-fit");
    localStorage.removeItem("dashboard-banner-pos");
    localStorage.removeItem("dashboard-banner-height");
    setShowEditor(false);
  }

  return (
    <div>
      {/* Hidden file input for editor */}
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleEditorFile} />

      {/* Banner Editor Modal */}
      {showEditor && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowEditor(false)} />
          <div className="relative bg-[#1a1a1a] border border-white/[0.10] rounded-md shadow-2xl w-full max-w-2xl mx-4 p-6 z-10">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-white">Edit Banner</h2>
              <button onClick={() => setShowEditor(false)} className="text-white/40 hover:text-white transition-colors duration-150">
                <X size={20} />
              </button>
            </div>

            {/* Preview */}
            <div className="rounded-md border border-white/[0.08] overflow-hidden mb-5 bg-black/30">
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
                <div className="flex items-center justify-center text-white/20 text-sm" style={{ height: `${editorHeight}px` }}>
                  No image selected
                </div>
              )}
            </div>

            {/* Upload button */}
            <div className="mb-5">
              <button
                onClick={() => fileRef.current?.click()}
                className="bg-primary-500 text-white px-4 py-2 rounded text-sm font-semibold hover:bg-primary-600 transition-colors duration-150 flex items-center gap-2"
              >
                <ImagePlus size={16} />
                {editorUrl ? "Change Image" : "Upload Image"}
              </button>
            </div>

            {/* Controls */}
            <div className="grid grid-cols-3 gap-4 mb-5">
              <div>
                <label className="block text-xs text-white/40 mb-2">Fit</label>
                <select
                  value={editorFit}
                  onChange={(e) => setEditorFit(e.target.value)}
                  className="w-full bg-white/[0.06] border border-white/[0.08] rounded-sm px-3 py-2 text-sm text-white focus:ring-1 focus:ring-white/20 focus:outline-none"
                >
                  <option value="cover">Cover (fill & crop)</option>
                  <option value="contain">Contain (fit inside)</option>
                  <option value="fill">Stretch to fill</option>
                  <option value="none">Original size</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-white/40 mb-2">Position</label>
                <select
                  value={editorPos}
                  onChange={(e) => setEditorPos(e.target.value)}
                  className="w-full bg-white/[0.06] border border-white/[0.08] rounded-sm px-3 py-2 text-sm text-white focus:ring-1 focus:ring-white/20 focus:outline-none"
                >
                  <option value="center">Center</option>
                  <option value="top">Top</option>
                  <option value="bottom">Bottom</option>
                  <option value="left">Left</option>
                  <option value="right">Right</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-white/40 mb-2">Height: {editorHeight}px</label>
                <input
                  type="range"
                  min={100}
                  max={400}
                  step={8}
                  value={editorHeight}
                  onChange={(e) => setEditorHeight(parseInt(e.target.value))}
                  className="w-full accent-primary-500 mt-1"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between">
              {bannerUrl && (
                <button onClick={removeBanner} className="text-xs text-red-400 hover:text-red-300 transition-colors duration-150">
                  Remove Banner
                </button>
              )}
              <div className="flex gap-3 ml-auto">
                <button onClick={() => setShowEditor(false)} className="px-5 py-2 text-sm text-white/40 hover:text-white transition-colors duration-150">
                  Cancel
                </button>
                <button
                  onClick={applyBanner}
                  disabled={!editorUrl}
                  className="bg-primary-500 text-white px-6 py-2 rounded text-sm font-semibold hover:bg-primary-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-150"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Banner display */}
      <div className="mb-6">
        <div
          onClick={openEditor}
          className="relative rounded-md border border-white/[0.08] overflow-hidden cursor-pointer group"
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
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                <div className="flex items-center gap-2 text-white/80 text-sm font-medium">
                  <ImagePlus size={18} />
                  Edit Banner
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6 pt-12">
                <h1 className="text-5xl font-bold text-white">{year} Dashboard</h1>
                <p className="text-white/60 mt-2">
                  Welcome back, Coach. Here&apos;s your {year} season overview.
                </p>
              </div>
            </>
          ) : (
            <div className="h-48 bg-white/[0.04] flex flex-col items-center justify-center group-hover:bg-white/[0.06] transition-colors duration-150">
              <h1 className="text-5xl font-bold text-white text-center">{year} Dashboard</h1>
              <p className="text-white/40 mt-2 text-center">
                Welcome back, Coach. Here&apos;s your {year} season overview.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-white/[0.04] border border-white/[0.08] rounded-md p-4">
          <span className="text-xs text-white/40">Players</span>
          <p className="text-2xl font-bold text-white">{data?.playerCount ?? "—"}</p>
        </div>
        <div className="bg-white/[0.04] border border-white/[0.08] rounded-md p-4">
          <span className="text-xs text-white/40">Games</span>
          <p className="text-2xl font-bold text-white">{data?.gameCount ?? "—"}</p>
        </div>
        <div className="bg-white/[0.04] border border-white/[0.08] rounded-md p-4">
          <span className="text-xs text-white/40">Team Avg</span>
          <p className={`text-2xl font-bold ${pctColor(data?.teamFinalAvg ?? null)}`}>
            {data?.teamFinalAvg ? `${data.teamFinalAvg}%` : "—"}
          </p>
        </div>
        <div className="bg-white/[0.04] border border-white/[0.08] rounded-md p-4">
          <span className="text-xs text-white/40">Top Performer</span>
          <p className="text-lg font-bold text-white truncate">
            {data?.topJob ? `#${data.topJob.number} ${data.topJob.name}` : "—"}
          </p>
          {data?.topJob && (
            <span className={`text-xs font-bold ${pctColor(data.topJob.finalPct)}`}>
              {data.topJob.finalPct}% final
            </span>
          )}
        </div>
      </div>

      {/* Main grid — tall detailed cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* ROSTER CARD */}
        <Link href="/dashboard/players" className="block">
          <div className="group bg-white/[0.04] rounded-md border border-white/[0.08] hover:border-primary-400/30 transition-all duration-150 hover:bg-white/[0.06] h-full">
            <div className="flex items-center justify-between p-4 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <Users size={18} className="text-primary-300" />
                <h3 className="text-sm font-bold text-white">Roster</h3>
              </div>
              <div className="flex items-center gap-1 text-white/20 group-hover:text-primary-400">
                <span className="text-xs">{data?.playerCount ?? 0}</span>
                <ChevronRight size={14} />
              </div>
            </div>
            <div className="p-0">
              {data?.playerStats && data.playerStats.length > 0 ? (
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                      <th className="text-left px-3 py-2 text-white/40 font-medium">#</th>
                      <th className="text-left px-2 py-2 text-white/40 font-medium">Name</th>
                      <th className="text-center px-2 py-2 text-white/40 font-medium">Pos</th>
                      <th className="text-center px-2 py-2 text-white/40 font-medium">Yr</th>
                      <th className="text-center px-2 py-2 text-white/40 font-medium">Snaps</th>
                      <th className="text-center px-2 py-2 text-white/40 font-medium">Final</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.playerStats.map((p) => (
                      <tr key={p.id} className="border-b border-white/[0.04] hover:bg-white/[0.03]">
                        <td className="px-3 py-1.5 font-mono text-white/50">{p.number}</td>
                        <td className="px-2 py-1.5 text-white font-medium truncate max-w-[120px]">{p.name}</td>
                        <td className="text-center px-2 py-1.5 text-white/50">{p.position}</td>
                        <td className="text-center px-2 py-1.5 text-white/40">{p.year?.slice(0, 2) || "—"}</td>
                        <td className="text-center px-2 py-1.5 text-white/50">{p.snaps || "—"}</td>
                        <td className={`text-center px-2 py-1.5 font-bold ${pctColor(p.snaps > 0 ? p.finalPct : null)}`}>
                          {p.snaps > 0 ? `${p.finalPct}%` : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-6 text-center text-xs text-white/30">No players yet</div>
              )}
            </div>
          </div>
        </Link>

        {/* GAMES CARD */}
        <Link href="/dashboard/grades" className="block">
          <div className="group bg-white/[0.04] rounded-md border border-white/[0.08] hover:border-primary-400/30 transition-all duration-150 hover:bg-white/[0.06] h-full">
            <div className="flex items-center justify-between p-4 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-primary-300" />
                <h3 className="text-sm font-bold text-white">Games</h3>
              </div>
              <div className="flex items-center gap-1 text-white/20 group-hover:text-primary-400">
                <span className="text-xs">{data?.gameCount ?? 0}</span>
                <ChevronRight size={14} />
              </div>
            </div>
            <div className="p-0">
              {data?.games && data.games.length > 0 ? (
                <div className="divide-y divide-white/[0.04]">
                  {data.games.map((g) => (
                    <div key={g.id} className="flex items-center justify-between px-4 py-3 hover:bg-white/[0.03]">
                      <div>
                        <div className="text-xs font-bold text-white">Game {g.weekNumber}</div>
                        <div className="text-sm text-white/70">vs {g.opponent}</div>
                        <div className="text-[10px] text-white/30">{new Date(g.date).toLocaleDateString()}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-white">{g.snapCount}</div>
                        <div className="text-[10px] text-white/30">snaps</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-white/30">No games yet</div>
              )}
            </div>
          </div>
        </Link>

        {/* TEAM GRADES CARD */}
        <Link href="/dashboard/grades" className="block">
          <div className="group bg-white/[0.04] rounded-md border border-white/[0.08] hover:border-primary-400/30 transition-all duration-150 hover:bg-white/[0.06] h-full">
            <div className="flex items-center justify-between p-4 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <Star size={18} className="text-primary-300" />
                <h3 className="text-sm font-bold text-white">Team Grades</h3>
              </div>
              <ChevronRight size={14} className="text-white/20 group-hover:text-primary-400" />
            </div>

            {/* Team averages */}
            <div className="grid grid-cols-3 border-b border-white/[0.06]">
              <div className="p-3 text-center border-r border-white/[0.04]">
                <div className="text-[10px] text-white/40 mb-1">JOB AVG</div>
                <div className={`text-xl font-bold ${pctColor(data?.teamJobAvg ?? null)}`}>
                  {data?.teamJobAvg ? `${data.teamJobAvg}%` : "—"}
                </div>
              </div>
              <div className="p-3 text-center border-r border-white/[0.04]">
                <div className="text-[10px] text-white/40 mb-1">TECH AVG</div>
                <div className={`text-xl font-bold ${pctColor(data?.teamTechAvg ?? null)}`}>
                  {data?.teamTechAvg ? `${data.teamTechAvg}%` : "—"}
                </div>
              </div>
              <div className="p-3 text-center">
                <div className="text-[10px] text-white/40 mb-1">FINAL AVG</div>
                <div className={`text-xl font-bold ${pctColor(data?.teamFinalAvg ?? null)}`}>
                  {data?.teamFinalAvg ? `${data.teamFinalAvg}%` : "—"}
                </div>
              </div>
            </div>

            {/* Leaderboard */}
            <div className="p-0">
              {data?.byFinal && data.byFinal.length > 0 ? (
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                      <th className="text-left px-3 py-2 text-white/40 font-medium">Player</th>
                      <th className="text-center px-2 py-2 text-white/40 font-medium">Snaps</th>
                      <th className="text-center px-2 py-2 text-white/40 font-medium">Job</th>
                      <th className="text-center px-2 py-2 text-white/40 font-medium">Tech</th>
                      <th className="text-center px-2 py-2 text-white/40 font-medium">Final</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.byFinal.map((p, i) => (
                      <tr key={p.id} className={`border-b border-white/[0.04] ${pctBg(p.finalPct)}`}>
                        <td className="px-3 py-1.5">
                          <span className="text-white/30 mr-1.5">{i + 1}.</span>
                          <span className="text-white font-medium">#{p.number}</span>
                          <span className="text-white/50 ml-1">{p.name}</span>
                        </td>
                        <td className="text-center px-2 py-1.5 text-white/50">{p.snaps}</td>
                        <td className={`text-center px-2 py-1.5 font-bold ${pctColor(p.jobPct)}`}>{p.jobPct}%</td>
                        <td className={`text-center px-2 py-1.5 font-bold ${pctColor(p.techPct)}`}>{p.techPct}%</td>
                        <td className={`text-center px-2 py-1.5 font-bold ${pctColor(p.finalPct)}`}>{p.finalPct}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-6 text-center text-xs text-white/30">No grades yet — start grading a game</div>
              )}
            </div>
          </div>
        </Link>

        {/* TOP JOB CARD */}
        <Link href="/dashboard/grades" className="block">
          <div className="group bg-white/[0.04] rounded-md border border-white/[0.08] hover:border-primary-400/30 transition-all duration-150 hover:bg-white/[0.06] h-full">
            <div className="flex items-center justify-between p-4 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <Trophy size={18} className="text-primary-300" />
                <h3 className="text-sm font-bold text-white">Job Grade Rankings</h3>
              </div>
              <ChevronRight size={14} className="text-white/20 group-hover:text-primary-400" />
            </div>
            <div className="p-0">
              {data?.byJob && data.byJob.length > 0 ? (
                <div className="divide-y divide-white/[0.04]">
                  {data.byJob.map((p, i) => (
                    <div key={p.id} className={`flex items-center justify-between px-4 py-2.5 ${pctBg(p.jobPct)}`}>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-white/30 w-4">{i + 1}.</span>
                        <div>
                          <span className="text-xs font-bold text-white">#{p.number}</span>
                          <span className="text-xs text-white/50 ml-1.5">{p.name}</span>
                          <span className="text-[10px] text-white/30 ml-1.5">{p.position}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`text-sm font-bold ${pctColor(p.jobPct)}`}>{p.jobPct}%</span>
                        <div className="text-[10px] text-white/30">{p.snaps} snaps</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-white/30">No grades yet</div>
              )}
            </div>
          </div>
        </Link>

        {/* TOP TECH CARD */}
        <Link href="/dashboard/grades" className="block">
          <div className="group bg-white/[0.04] rounded-md border border-white/[0.08] hover:border-primary-400/30 transition-all duration-150 hover:bg-white/[0.06] h-full">
            <div className="flex items-center justify-between p-4 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <Wrench size={18} className="text-primary-300" />
                <h3 className="text-sm font-bold text-white">Tech Grade Rankings</h3>
              </div>
              <ChevronRight size={14} className="text-white/20 group-hover:text-primary-400" />
            </div>
            <div className="p-0">
              {data?.byTech && data.byTech.length > 0 ? (
                <div className="divide-y divide-white/[0.04]">
                  {data.byTech.map((p, i) => (
                    <div key={p.id} className={`flex items-center justify-between px-4 py-2.5 ${pctBg(p.techPct)}`}>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-white/30 w-4">{i + 1}.</span>
                        <div>
                          <span className="text-xs font-bold text-white">#{p.number}</span>
                          <span className="text-xs text-white/50 ml-1.5">{p.name}</span>
                          <span className="text-[10px] text-white/30 ml-1.5">{p.position}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`text-sm font-bold ${pctColor(p.techPct)}`}>{p.techPct}%</span>
                        <div className="text-[10px] text-white/30">{p.snaps} snaps</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-white/30">No grades yet</div>
              )}
            </div>
          </div>
        </Link>

      </div>
    </div>
  );
}
