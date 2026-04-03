"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Plus, Trash2, X, Star, ChevronDown } from "lucide-react";
import { calcGradeStats, gradeColorClass, gradeBgClass } from "@/lib/grading";

/* ── types ─────────────────────────────────────────── */
interface Player {
  id: string;
  name: string;
  number: number;
  position: string;
}

interface SnapGradeData {
  id: string;
  playerId: string;
  value: number;
  player: Player;
}

interface GameSnap {
  id: string;
  snapNumber: number;
  playName: string;
  playType: string;
  comment: string;
  grades: SnapGradeData[];
}

interface GamePlayerStatsData {
  id: string;
  playerId: string;
  player: Player;
  sacks: number;
  missedAssignments: number;
  penalties: number;
  pressures: number;
  badSnaps: number;
  knockdowns: number;
  da: number;
}

interface Game {
  id: string;
  opponent: string;
  date: string;
  weekNumber: number;
  snaps: GameSnap[];
  playerStats: GamePlayerStatsData[];
  _count?: { snaps: number };
}

interface Play {
  id: string;
  name: string;
  category: string;
}

const OL_POSITIONS = ["LT", "LG", "C", "RG", "RT"] as const;
type OLPosition = typeof OL_POSITIONS[number];
type LineupMap = Record<OLPosition, string>; // position -> playerId
const EMPTY_LINEUP: LineupMap = { LT: "", LG: "", C: "", RG: "", RT: "" };

/* ── Modal ─────────────────────────────────────────── */
function Modal({ open, onClose, title, children }: {
  open: boolean; onClose: () => void; title: string; children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative backdrop-blur-xl bg-white/[0.08] border border-white/15 rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 z-10">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-white">{title}</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white"><X size={20} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ── grade helpers (aliases for JSX convenience) ───── */
const gradeColor = gradeColorClass;
const gradeBg    = gradeBgClass;

/* ── main page ─────────────────────────────────────── */
export default function GradesPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
  const [gameData, setGameData] = useState<Game | null>(null);

  // New game modal
  const [showNewGame, setShowNewGame] = useState(false);
  const [newGame, setNewGame] = useState({ opponent: "", date: "", weekNumber: 1 });

  // Plays library
  const [plays, setPlays] = useState<Play[]>([]);

  // Per-game lineup & subs (persisted to localStorage)
  const [lineup, setLineup] = useState<Record<string, LineupMap>>({});
  const [extras, setExtras] = useState<Record<string, string[]>>({});

  // New snap row
  const [newPlayName, setNewPlayName] = useState("");
  const [newPlayType, setNewPlayType] = useState("run");
  const newPlayRef = useRef<HTMLSelectElement>(null);

  // Inline editing
  const [editingCell, setEditingCell] = useState<string | null>(null); // "snapId-playerId"

  // Local stat values for controlled inputs (auto-save on change)
  const [localStats, setLocalStats] = useState<Record<string, Record<string, number>>>({});
  const saveTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const fetchPlayers = useCallback(async () => {
    const res = await fetch("/api/players");
    if (res.ok) setPlayers(await res.json());
  }, []);

  const fetchGames = useCallback(async () => {
    const res = await fetch("/api/games");
    if (res.ok) setGames(await res.json());
  }, []);

  const fetchPlays = useCallback(async () => {
    const res = await fetch("/api/plays");
    if (res.ok) setPlays(await res.json());
  }, []);

  const fetchGameData = useCallback(async (gameId: string) => {
    const res = await fetch(`/api/games/${gameId}`);
    if (res.ok) setGameData(await res.json());
  }, []);

  // Load lineup/extras from localStorage on mount
  useEffect(() => {
    try {
      const l = localStorage.getItem("gab-lineup");
      if (l) setLineup(JSON.parse(l));
      const e = localStorage.getItem("gab-extras");
      if (e) setExtras(JSON.parse(e));
    } catch {}
  }, []);

  useEffect(() => { localStorage.setItem("gab-lineup", JSON.stringify(lineup)); }, [lineup]);
  useEffect(() => { localStorage.setItem("gab-extras", JSON.stringify(extras)); }, [extras]);

  useEffect(() => { fetchPlayers(); fetchGames(); fetchPlays(); }, [fetchPlayers, fetchGames, fetchPlays]);

  useEffect(() => {
    if (selectedGameId) fetchGameData(selectedGameId);
    else { setGameData(null); setLocalStats({}); }
  }, [selectedGameId, fetchGameData]);

  // Sync localStats whenever gameData changes (e.g. after initial load)
  useEffect(() => {
    if (!gameData) return;
    setLocalStats((prev) => {
      const next = { ...prev };
      for (const ps of gameData.playerStats) {
        if (!next[ps.playerId]) {
          next[ps.playerId] = {
            sacks: ps.sacks,
            missedAssignments: ps.missedAssignments,
            penalties: ps.penalties,
            pressures: ps.pressures,
            badSnaps: ps.badSnaps,
            knockdowns: ps.knockdowns,
            da: ps.da,
          };
        }
      }
      return next;
    });
  }, [gameData]);

  /* ── game handlers ── */
  async function handleCreateGame(e: React.FormEvent) {
    e.preventDefault();
    if (!newGame.opponent.trim() || !newGame.date) return;
    const res = await fetch("/api/games", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newGame),
    });
    if (res.ok) {
      const created = await res.json();
      setShowNewGame(false);
      setNewGame({ opponent: "", date: "", weekNumber: 1 });
      await fetchGames();
      setSelectedGameId(created.id);
    }
  }

  /* ── snap handlers ── */
  async function handleAddSnap(e: React.FormEvent) {
    e.preventDefault();
    if (!newPlayName.trim() || !selectedGameId) return;
    await fetch(`/api/games/${selectedGameId}/snaps`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ playName: newPlayName.trim().toUpperCase(), playType: newPlayType }),
    });
    setNewPlayName("");
    await fetchGameData(selectedGameId);
    newPlayRef.current?.focus();
  }

  async function handleDeleteSnap(snapId: string) {
    if (!selectedGameId) return;
    await fetch(`/api/games/${selectedGameId}/snaps/${snapId}`, { method: "DELETE" });
    await fetchGameData(selectedGameId);
  }

  async function handleGradeChange(snapId: string, playerId: string, value: number | null) {
    if (!selectedGameId) return;
    const snap = gameData?.snaps.find((s) => s.id === snapId);
    await fetch(`/api/games/${selectedGameId}/snaps/${snapId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        playName: snap?.playName || "",
        grades: [{ playerId, value }],
      }),
    });
    setEditingCell(null);
    await fetchGameData(selectedGameId);
  }

  async function handleCommentChange(snapId: string, comment: string) {
    if (!selectedGameId) return;
    const snap = gameData?.snaps.find((s) => s.id === snapId);
    await fetch(`/api/games/${selectedGameId}/snaps/${snapId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ playName: snap?.playName || "", comment }),
    });
    await fetchGameData(selectedGameId);
  }

  async function handleStatChange(playerId: string, field: string, value: number) {
    if (!selectedGameId) return;
    await fetch(`/api/games/${selectedGameId}/stats`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ playerId, [field]: value }),
    });
  }

  function handleStatInput(playerId: string, field: string, value: number) {
    // Update local state immediately
    setLocalStats((prev) => ({
      ...prev,
      [playerId]: { ...(prev[playerId] ?? {}), [field]: value },
    }));
    // Debounce the actual save
    const key = `${playerId}-${field}`;
    if (saveTimers.current[key]) clearTimeout(saveTimers.current[key]);
    saveTimers.current[key] = setTimeout(() => {
      handleStatChange(playerId, field, value);
    }, 600);
  }

  /* ── summary calculations (uses shared grading algorithm) ── */
  function calcStats(playerId: string, playTypeFilter?: string) {
    if (!gameData) return { snaps: 0, jobPct: 0, techPct: 0, totalPct: 0 };
    const filteredSnaps = playTypeFilter
      ? gameData.snaps.filter((s) => s.playType === playTypeFilter)
      : gameData.snaps;
    const grades = filteredSnaps
      .flatMap((s) => s.grades)
      .filter((g) => g.playerId === playerId);
    const { snaps, jobPct, techPct, finalPct } = calcGradeStats(grades);
    return { snaps, jobPct, techPct, totalPct: finalPct };
  }

  function getPlayerStats(playerId: string): GamePlayerStatsData | undefined {
    return gameData?.playerStats.find((s) => s.playerId === playerId);
  }

  /* ── lineup helpers ── */
  const gameLineup: LineupMap = selectedGameId ? (lineup[selectedGameId] ?? EMPTY_LINEUP) : EMPTY_LINEUP;
  const gameExtras: string[] = selectedGameId ? (extras[selectedGameId] ?? []) : [];

  function getLineupPlayer(pos: OLPosition): Player | undefined {
    const id = gameLineup[pos];
    return id ? players.find((p) => p.id === id) : undefined;
  }

  function setLineupByNumber(pos: OLPosition, num: number) {
    if (!selectedGameId) return;
    const player = players.find((p) => p.number === num);
    setLineup((prev) => ({
      ...prev,
      [selectedGameId]: { ...(prev[selectedGameId] ?? EMPTY_LINEUP), [pos]: player?.id ?? "" },
    }));
  }

  function addExtra(playerId: string) {
    if (!selectedGameId || !playerId) return;
    setExtras((prev) => ({
      ...prev,
      [selectedGameId]: Array.from(new Set([...(prev[selectedGameId] ?? []), playerId])),
    }));
  }

  function removeExtra(playerId: string) {
    if (!selectedGameId) return;
    setExtras((prev) => ({
      ...prev,
      [selectedGameId]: (prev[selectedGameId] ?? []).filter((id) => id !== playerId),
    }));
  }

  // Ordered list of players to show as grade columns
  const lineupPlayerIds = new Set(Object.values(gameLineup).filter(Boolean));
  const extraPlayerIds = new Set(gameExtras);
  const extraPlayers = gameExtras.map((id) => players.find((p) => p.id === id)).filter(Boolean) as Player[];
  const availableSubs = players.filter((p) => !lineupPlayerIds.has(p.id) && !extraPlayerIds.has(p.id));

  // All grade columns in order: 5 positions (may be unassigned) + extra subs
  const gradeColumns: { pos?: OLPosition; player: Player | null }[] = [
    ...OL_POSITIONS.map((pos) => ({ pos, player: getLineupPlayer(pos) ?? null })),
    ...extraPlayers.map((player) => ({ player })),
  ];

  /* ── no players state ── */
  if (players.length === 0) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Grades</h1>
        <div className="backdrop-blur-md bg-white/[0.04] border border-white/10 rounded-2xl p-12 text-center">
          <Star size={48} className="mx-auto text-white/20 mb-4" />
          <p className="text-sm text-white/40">Add players to your roster first before grading.</p>
        </div>
      </div>
    );
  }

  /* ── main render ── */
  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">OL Grades</h1>
          <p className="text-sm text-white/40">Play-by-play grading &amp; summary stats</p>
        </div>
      </div>

      {/* Game selector */}
      <div className="backdrop-blur-md bg-white/[0.04] border border-white/10 rounded-2xl px-4 py-3 mb-6 flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <label className="text-xs text-white/40">Game</label>
          <select
            value={selectedGameId || ""}
            onChange={(e) => {
              const v = e.target.value;
              if (v === "__add__") { setShowNewGame(true); return; }
              setSelectedGameId(v || null);
            }}
            className="bg-white/[0.06] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-white/30 focus:outline-none min-w-[260px]"
          >
            <option value="">Select a game...</option>
            {games.map((g) => (
              <option key={g.id} value={g.id}>
                Game {g.weekNumber} — vs {g.opponent} ({new Date(g.date).toLocaleDateString()})
              </option>
            ))}
            <option value="__add__">+ Add new game…</option>
          </select>
        </div>
      </div>

      {/* Player Summary (shows when a game is selected) */}
      {selectedGameId && (
        <div className="backdrop-blur-md bg-white/[0.04] border border-white/10 rounded-2xl overflow-x-auto mb-6">
          <div className="px-4 py-3 border-b border-white/10">
            <h3 className="text-sm font-bold text-white">Players — Game Summary</h3>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.03]">
                <th className="text-left px-4 py-2 text-xs text-white/40 font-medium min-w-[140px]">PLAYER</th>
                <th className="text-left px-3 py-2 text-xs text-white/40 font-medium w-16"></th>
                <th className="text-center px-2 py-2 text-xs text-white/40 font-medium min-w-[55px]">SNAPS</th>
                <th className="text-center px-2 py-2 text-xs text-white/40 font-medium min-w-[65px]">JOB %</th>
                <th className="text-center px-2 py-2 text-xs text-white/40 font-medium min-w-[65px]">TECH %</th>
                <th className="text-center px-2 py-2 text-xs text-white/40 font-medium min-w-[65px]">FINAL %</th>
                <th className="text-center px-1 py-2 text-xs text-white/40 font-medium min-w-[50px]">SACKS</th>
                <th className="text-center px-1 py-2 text-xs text-white/40 font-medium min-w-[50px]">MA's</th>
                <th className="text-center px-1 py-2 text-xs text-white/40 font-medium min-w-[65px]">PEN</th>
                <th className="text-center px-1 py-2 text-xs text-white/40 font-medium min-w-[65px]">PRESS</th>
                <th className="text-center px-1 py-2 text-xs text-white/40 font-medium min-w-[60px]">B.SNAP</th>
                <th className="text-center px-1 py-2 text-xs text-white/40 font-medium min-w-[55px]">KD</th>
                <th className="text-center px-1 py-2 text-xs text-white/40 font-medium min-w-[45px]">DA</th>
              </tr>
            </thead>
            <tbody>
              {players.map((p) => {
                const run = calcStats(p.id, "run");
                const pass = calcStats(p.id, "pass");
                const total = calcStats(p.id);
                const hasGrades = total.snaps > 0;

                function statCell(val: number, snaps: number) {
                  if (snaps === 0) return <td className="text-center px-2 py-1.5 text-xs text-white/20">—</td>;
                  const cls = val >= 80 ? "text-green-400" : val >= 60 ? "text-yellow-400" : "text-red-500";
                  return <td className={`text-center px-2 py-1.5 text-xs font-bold ${cls}`}>{val}%</td>;
                }

                return (
                  <React.Fragment key={p.id}>
                    {/* RUN row */}
                    <tr className={`border-t border-white/[0.06] ${hasGrades ? "" : "opacity-40"}`}>
                      <td className="px-4 py-1.5 font-medium text-white text-xs" rowSpan={3}>
                        <div className="font-semibold">{p.name}</div>
                        <div className="text-white/40">{p.position} #{p.number}</div>
                      </td>
                      <td className="px-3 py-1.5 text-xs font-medium text-blue-400">RUN</td>
                      <td className="text-center px-2 py-1.5 text-xs text-white">{run.snaps}</td>
                      {statCell(run.jobPct, run.snaps)}
                      {statCell(run.techPct, run.snaps)}
                      {statCell(run.totalPct, run.snaps)}
                      <td colSpan={7}></td>
                    </tr>
                    {/* PASS row */}
                    <tr>
                      <td className="px-3 py-1.5 text-xs font-medium text-purple-400">PASS</td>
                      <td className="text-center px-2 py-1.5 text-xs text-white">{pass.snaps}</td>
                      {statCell(pass.jobPct, pass.snaps)}
                      {statCell(pass.techPct, pass.snaps)}
                      {statCell(pass.totalPct, pass.snaps)}
                      <td colSpan={7}></td>
                    </tr>
                    {/* TOTAL row — includes editable stats */}
                    <tr className="border-b-2 border-white/10 bg-white/[0.03]">
                      <td className="px-3 py-1.5 text-xs font-bold text-white">TOTAL</td>
                      <td className="text-center px-2 py-1.5 text-xs font-bold text-white">{total.snaps}</td>
                      {statCell(total.jobPct, total.snaps)}
                      {statCell(total.techPct, total.snaps)}
                      {statCell(total.totalPct, total.snaps)}
                      {(["sacks", "missedAssignments", "penalties", "pressures", "badSnaps", "knockdowns", "da"] as const).map((field) => {
                        const val = localStats[p.id]?.[field] ?? 0;
                        return (
                          <td key={field} className="text-center px-1 py-1">
                            <input
                              type="number"
                              min={0}
                              value={val}
                              onChange={(e) => handleStatInput(p.id, field, parseInt(e.target.value) || 0)}
                              className="w-10 bg-transparent border border-white/20 rounded text-center text-xs text-white py-0.5 focus:ring-1 focus:ring-white/30 focus:outline-none"
                            />
                          </td>
                        );
                      })}
                    </tr>
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* No game selected */}
      {!selectedGameId && (
        <div className="backdrop-blur-md bg-white/[0.04] border border-white/10 rounded-2xl p-12 text-center">
          <p className="text-sm text-white/40 mb-4">Select or create a game to start grading.</p>
          <button onClick={() => setShowNewGame(true)}
            className="bg-primary-500 text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-primary-600 transition-colors">
            Create Game
          </button>
        </div>
      )}

      {/* Game grading view */}
      {gameData && (
        <>
          {/* Game header */}
          <div className="backdrop-blur-md bg-white/[0.04] rounded-2xl p-5 border border-white/10 mb-6">
            <h2 className="text-xl font-bold text-white">
              Game {gameData.weekNumber} — vs {gameData.opponent}
            </h2>
            <p className="text-sm text-white/40 mt-1">
              Date: {new Date(gameData.date).toLocaleDateString()} · {gameData.snaps.length} snaps graded
            </p>
          </div>

          {/* KEY legend */}
          <div className="flex items-center gap-4 mb-4 text-xs text-white/40">
            <span className="font-medium text-white">KEY:</span>
            <span><span className="text-green-400 font-bold">4</span>=(+)(+)</span>
            <span><span className="text-yellow-400 font-bold">3</span>=(+)(-)</span>
            <span><span className="text-orange-400 font-bold">2</span>=(-)(+)</span>
            <span><span className="text-red-500 font-bold">1</span>=(-)(-)  </span>
            <span className="ml-2 text-white/50">Job / Technique</span>
          </div>

          {/* Grading table */}
          <div className="backdrop-blur-md bg-white/[0.04] border border-white/10 rounded-2xl overflow-x-auto mb-6">
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-10">
                <tr className="border-b border-white/10 bg-[#0d1117]">
                  <th className="text-left px-3 py-2 text-xs text-white/40 font-medium w-10">#</th>
                  <th className="text-left px-3 py-2 text-xs text-white/40 font-medium w-16">TYPE</th>
                  <th className="text-left px-3 py-2 text-xs text-white/40 font-medium min-w-[160px]">PLAY</th>
                  {/* Starting 5 position columns */}
                  {OL_POSITIONS.map((pos) => {
                    const player = getLineupPlayer(pos);
                    return (
                      <th key={pos} className="text-center px-2 py-1.5 text-xs font-medium min-w-[64px]">
                        <div className="text-white/40 font-semibold tracking-wide">{pos}</div>
                        <input
                          type="number"
                          min={1}
                          max={99}
                          value={player?.number ?? ""}
                          onChange={(e) => setLineupByNumber(pos, parseInt(e.target.value) || 0)}
                          placeholder="#"
                          className="w-12 mt-0.5 bg-white/[0.08] border border-white/20 rounded text-center text-xs text-white font-bold py-0.5 focus:outline-none focus:ring-1 focus:ring-primary-400 placeholder:text-white/20"
                        />
                      </th>
                    );
                  })}
                  {/* Extra sub columns */}
                  {extraPlayers.map((p) => (
                    <th key={p.id} className="text-center px-2 py-1.5 text-xs font-medium min-w-[64px]">
                      <div className="text-purple-400 font-semibold">{p.position}</div>
                      <div className="flex items-center justify-center gap-0.5 mt-0.5">
                        <span className="text-white font-bold text-xs">#{p.number}</span>
                        <button onClick={() => removeExtra(p.id)} className="text-white/20 hover:text-red-400 ml-1">
                          <X size={10} />
                        </button>
                      </div>
                    </th>
                  ))}
                  {/* Add sub button */}
                  {availableSubs.length > 0 && (
                    <th className="text-center px-1 py-1.5 min-w-[44px]">
                      <select
                        value=""
                        onChange={(e) => addExtra(e.target.value)}
                        className="bg-white/[0.08] border border-white/20 rounded text-xs text-white/50 focus:outline-none py-0.5 px-1 cursor-pointer"
                      >
                        <option value="">+ Sub</option>
                        {availableSubs.map((p) => (
                          <option key={p.id} value={p.id}>#{p.number} {p.name} ({p.position})</option>
                        ))}
                      </select>
                    </th>
                  )}
                  <th className="text-left px-3 py-2 text-xs text-white/40 font-medium min-w-[140px]">COMMENTS</th>
                  <th className="w-8"></th>
                </tr>
              </thead>
              <tbody>
                {gameData.snaps.map((snap) => (
                  <tr key={snap.id} className="border-b border-white/[0.06] hover:bg-white/[0.03]">
                    <td className="px-3 py-1.5 text-xs text-white/40">{snap.snapNumber}</td>
                    <td className="px-2 py-1">
                      <select
                        value={snap.playType}
                        onChange={async (e) => {
                          if (!selectedGameId) return;
                          await fetch(`/api/games/${selectedGameId}/snaps/${snap.id}`, {
                            method: "PUT",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ playName: snap.playName, playType: e.target.value }),
                          });
                          await fetchGameData(selectedGameId);
                        }}
                        className="bg-transparent border border-white/10 rounded text-xs text-white/50 focus:ring-1 focus:ring-white/30 focus:outline-none py-0.5 px-1"
                      >
                        <option value="run">Run</option>
                        <option value="pass">Pass</option>
                        <option value="draw-screen">Draw</option>
                      </select>
                    </td>
                    <td className="px-2 py-1">
                      {(() => {
                        const opts = plays.filter((p) => p.category === snap.playType);
                        return opts.length > 0 ? (
                          <select
                            value={snap.playName}
                            onChange={async (e) => {
                              await fetch(`/api/games/${selectedGameId}/snaps/${snap.id}`, {
                                method: "PUT",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ playName: e.target.value, playType: snap.playType }),
                              });
                              await fetchGameData(selectedGameId!);
                            }}
                            className="bg-transparent border border-white/10 rounded text-xs text-white font-medium uppercase focus:ring-1 focus:ring-white/30 focus:outline-none py-0.5 px-1 min-w-[120px]"
                          >
                            <option value="">— select —</option>
                            {opts.map((p) => (
                              <option key={p.id} value={p.name.toUpperCase()}>{p.name.toUpperCase()}</option>
                            ))}
                          </select>
                        ) : (
                          <span className="text-xs font-medium text-white uppercase">{snap.playName}</span>
                        );
                      })()}
                    </td>
                    {gradeColumns.map(({ pos, player }, colIdx) => {
                      if (!player) {
                        return (
                          <td key={pos ?? `empty-${colIdx}`} className="text-center px-1 py-1">
                            <span className="text-white/10 text-xs">—</span>
                          </td>
                        );
                      }
                      const grade = snap.grades.find((g) => g.playerId === player.id);
                      const cellKey = `${snap.id}-${player.id}`;
                      const isEditing = editingCell === cellKey;
                      return (
                        <td key={player.id} className={`text-center px-1 py-1 ${grade ? gradeBg(grade.value) : ""}`}>
                          {isEditing ? (
                            <select
                              autoFocus
                              defaultValue={grade?.value || 0}
                              onChange={(e) => {
                                const val = parseInt(e.target.value);
                                handleGradeChange(snap.id, player.id, val || null);
                              }}
                              onBlur={() => setEditingCell(null)}
                              className="w-12 bg-white/[0.06] border border-white/20 rounded px-1 py-0.5 text-xs text-white text-center focus:outline-none"
                            >
                              <option value={0}>—</option>
                              <option value={4}>4</option>
                              <option value={3}>3</option>
                              <option value={2}>2</option>
                              <option value={1}>1</option>
                            </select>
                          ) : (
                            <button
                              onClick={() => setEditingCell(cellKey)}
                              className={`w-8 h-7 rounded text-xs font-bold cursor-pointer hover:ring-1 hover:ring-white/30 transition-all ${
                                grade ? gradeColor(grade.value) : "text-white/20"
                              }`}
                            >
                              {grade ? grade.value : "·"}
                            </button>
                          )}
                        </td>
                      );
                    })}
                    <td className="px-2 py-1">
                      <input
                        type="text"
                        defaultValue={snap.comment}
                        onBlur={(e) => {
                          if (e.target.value !== snap.comment) {
                            handleCommentChange(snap.id, e.target.value);
                          }
                        }}
                        className="w-full bg-transparent border-none text-xs text-white/40 focus:text-white focus:outline-none focus:ring-1 focus:ring-white/20 rounded px-1 py-0.5"
                        placeholder="..."
                      />
                    </td>
                    <td className="px-1 py-1">
                      <button
                        onClick={() => handleDeleteSnap(snap.id)}
                        className="text-white/20 hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={12} />
                      </button>
                    </td>
                  </tr>
                ))}

                {/* Add new snap row */}
                <tr className="bg-white/[0.02]">
                  <td className="px-3 py-2 text-xs text-white/40">{(gameData.snaps.length || 0) + 1}</td>
                  <td className="px-3 py-2" colSpan={gradeColumns.length + 3 + (availableSubs.length > 0 ? 1 : 0)}>
                    <form onSubmit={handleAddSnap} className="flex items-center gap-2">
                      <select
                        value={newPlayType}
                        onChange={(e) => setNewPlayType(e.target.value)}
                        className="bg-white/[0.06] border border-white/10 rounded px-2 py-1.5 text-xs text-white focus:ring-1 focus:ring-white/30 focus:outline-none"
                      >
                        <option value="run">Run</option>
                        <option value="pass">Pass</option>
                        <option value="draw-screen">Draw</option>
                      </select>
                      {(() => {
                        const opts = plays.filter((p) => p.category === newPlayType);
                        return opts.length > 0 ? (
                          <select
                            ref={newPlayRef}
                            value={newPlayName}
                            onChange={(e) => setNewPlayName(e.target.value)}
                            className="flex-1 bg-white/[0.06] border border-white/10 rounded px-3 py-1.5 text-xs text-white uppercase focus:ring-2 focus:ring-white/30 focus:outline-none"
                          >
                            <option value="">— Select Play —</option>
                            {opts.map((p) => (
                              <option key={p.id} value={p.name.toUpperCase()}>{p.name.toUpperCase()}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="text"
                            value={newPlayName}
                            onChange={(e) => setNewPlayName(e.target.value)}
                            placeholder="Play name — add plays on Runs/Pass/Draw pages first"
                            className="flex-1 bg-white/[0.06] border border-white/10 rounded px-3 py-1.5 text-xs text-white uppercase focus:ring-2 focus:ring-white/30 focus:outline-none placeholder:normal-case placeholder:text-white/30"
                          />
                        );
                      })()}
                      <button type="submit" className="bg-primary-500 text-white px-3 py-1.5 rounded text-xs font-semibold hover:bg-primary-600 transition-colors flex items-center gap-1">
                        <Plus size={12} /> Add
                      </button>
                    </form>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* ── Summary Stats ── */}
          <div className="backdrop-blur-md bg-white/[0.04] border border-white/10 rounded-2xl overflow-x-auto mb-6">
            <div className="px-4 py-3 border-b border-white/10">
              <h3 className="text-sm font-bold text-white">GRADE SUMMARY</h3>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.03]">
                  <th className="text-left px-4 py-2 text-xs text-white/40 font-medium min-w-[140px]">STAT</th>
                  {players.map((p) => (
                    <th key={p.id} className="text-center px-2 py-2 text-xs font-bold text-white min-w-[80px]">
                      #{p.number}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Snaps */}
                <tr className="border-b border-white/[0.06]">
                  <td className="px-4 py-2 font-medium text-white text-xs">SNAPS</td>
                  {players.map((p) => {
                    const s = calcStats(p.id);
                    return <td key={p.id} className="text-center px-2 py-2 text-xs text-white">{s.snaps}</td>;
                  })}
                </tr>
                {/* Job % */}
                <tr className="border-b border-white/[0.06]">
                  <td className="px-4 py-2 font-medium text-white text-xs">JOB %</td>
                  {players.map((p) => {
                    const s = calcStats(p.id);
                    return (
                      <td key={p.id} className={`text-center px-2 py-2 text-xs font-bold ${s.jobPct >= 80 ? "text-green-400" : s.jobPct >= 60 ? "text-yellow-400" : "text-red-500"}`}>
                        {s.snaps > 0 ? `${s.jobPct}%` : "—"}
                      </td>
                    );
                  })}
                </tr>
                {/* Tech % */}
                <tr className="border-b border-white/[0.06]">
                  <td className="px-4 py-2 font-medium text-white text-xs">TECH %</td>
                  {players.map((p) => {
                    const s = calcStats(p.id);
                    return (
                      <td key={p.id} className={`text-center px-2 py-2 text-xs font-bold ${s.techPct >= 80 ? "text-green-400" : s.techPct >= 60 ? "text-yellow-400" : "text-red-500"}`}>
                        {s.snaps > 0 ? `${s.techPct}%` : "—"}
                      </td>
                    );
                  })}
                </tr>
                {/* Final % */}
                <tr className="border-b border-white/10 bg-white/[0.03]">
                  <td className="px-4 py-2 font-bold text-white text-xs">FINAL %</td>
                  {players.map((p) => {
                    const s = calcStats(p.id);
                    return (
                      <td key={p.id} className={`text-center px-2 py-2 text-xs font-bold ${s.totalPct >= 80 ? "text-green-400" : s.totalPct >= 60 ? "text-yellow-400" : "text-red-500"}`}>
                        {s.snaps > 0 ? `${s.totalPct}%` : "—"}
                      </td>
                    );
                  })}
                </tr>

              </tbody>
            </table>
          </div>
        </>
      )}

      {/* New Game Modal */}
      <Modal open={showNewGame} onClose={() => setShowNewGame(false)} title="Create New Game">
        <form onSubmit={handleCreateGame} className="space-y-4">
          <div>
            <label className="block text-xs text-white/40 mb-2">Opponent *</label>
            <input
              type="text"
              value={newGame.opponent}
              onChange={(e) => setNewGame({ ...newGame, opponent: e.target.value })}
              placeholder="e.g. Whitworth"
              className="w-full bg-white/[0.06] border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:ring-2 focus:ring-white/30 focus:outline-none"
              autoFocus required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-white/40 mb-2">Date *</label>
              <input
                type="date"
                value={newGame.date}
                onChange={(e) => setNewGame({ ...newGame, date: e.target.value })}
                className="w-full bg-white/[0.06] border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:ring-2 focus:ring-white/30 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-2">Game #</label>
              <input
                type="number"
                min={1}
                value={newGame.weekNumber}
                onChange={(e) => setNewGame({ ...newGame, weekNumber: parseInt(e.target.value) || 1 })}
                className="w-full bg-white/[0.06] border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:ring-2 focus:ring-white/30 focus:outline-none"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-2">
            <button type="button" onClick={() => setShowNewGame(false)}
              className="px-5 py-2 text-sm text-white/40 hover:text-white transition-colors">Cancel</button>
            <button type="submit"
              className="bg-primary-500 text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-primary-600 transition-colors">Create Game</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
