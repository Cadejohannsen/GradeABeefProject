"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Plus, Trash2, X, Star, ChevronDown, Pencil } from "lucide-react";

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
  scheme: string;
  te: number;
  xtkl: number;
  xtkl2: number;
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

/* ── Modal ─────────────────────────────────────────── */
function Modal({ open, onClose, title, children }: {
  open: boolean; onClose: () => void; title: string; children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#1a1a1a] border border-white/[0.10] rounded-md shadow-2xl w-full max-w-md mx-4 p-6 z-10">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-white">{title}</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors duration-150"><X size={20} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ── grade helpers ─────────────────────────────────── */
function gradeColor(v: number) {
  switch (v) {
    case 4: return "text-green-400";
    case 3: return "text-yellow-400";
    case 2: return "text-orange-400";
    case 1: return "text-red-500";
    default: return "text-white/30";
  }
}

function gradeBg(v: number) {
  switch (v) {
    case 4: return "bg-green-500/15";
    case 3: return "bg-yellow-500/15";
    case 2: return "bg-orange-500/15";
    case 1: return "bg-red-500/15";
    default: return "";
  }
}

// 4=++ (good job, good tech), 3=+- (good job, bad tech), 2=-+ (bad job, good tech), 1=-- (bad job, bad tech)
function isJobPositive(v: number) { return v >= 3; }
function isTechPositive(v: number) { return v === 4 || v === 2; }

/* ── main page ─────────────────────────────────────── */
export default function GradesPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
  const [gameData, setGameData] = useState<Game | null>(null);

  // New game modal
  const [showNewGame, setShowNewGame] = useState(false);
  const [newGame, setNewGame] = useState({ opponent: "", date: "", weekNumber: 1 });

  // Edit game modal
  const [showEditGame, setShowEditGame] = useState(false);
  const [editGame, setEditGame] = useState({ id: "", opponent: "", date: "", weekNumber: 1 });

  // New snap row
  const [newPlayName, setNewPlayName] = useState("");
  const [newPlayType, setNewPlayType] = useState("run");
  const newPlayRef = useRef<HTMLInputElement>(null);

  // Inline editing
  const [editingCell, setEditingCell] = useState<string | null>(null); // "snapId-playerId"

  // Focus the active grade cell whenever editingCell changes
  useEffect(() => {
    if (editingCell) {
      requestAnimationFrame(() => {
        const el = document.querySelector(`[data-grade-cell="${editingCell}"]`) as HTMLElement;
        el?.focus();
      });
    }
  }, [editingCell]);

  // Close editing when clicking outside a grade cell
  useEffect(() => {
    function handleDocClick(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-grade-cell]") && !target.closest("[data-grade-btn]")) {
        setEditingCell(null);
      }
    }
    document.addEventListener("mousedown", handleDocClick);
    return () => document.removeEventListener("mousedown", handleDocClick);
  }, []);

  // Starters & Subs
  const [starters, setStarters] = useState<string[]>([]);
  const [subs, setSubs] = useState<string[]>([]);
  const [showSubPicker, setShowSubPicker] = useState(false);

  const fetchPlayers = useCallback(async () => {
    const res = await fetch("/api/players");
    if (res.ok) setPlayers(await res.json());
  }, []);

  const fetchGames = useCallback(async () => {
    const res = await fetch("/api/games");
    if (res.ok) setGames(await res.json());
  }, []);

  const fetchGameData = useCallback(async (gameId: string) => {
    const res = await fetch(`/api/games/${gameId}`);
    if (res.ok) setGameData(await res.json());
  }, []);

  useEffect(() => { fetchPlayers(); fetchGames(); }, [fetchPlayers, fetchGames]);

  useEffect(() => {
    if (selectedGameId) {
      fetchGameData(selectedGameId);
      // Load starters/subs from localStorage for this game
      const saved = localStorage.getItem(`lineup-${selectedGameId}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        setStarters(parsed.starters || []);
        setSubs(parsed.subs || []);
      } else {
        setStarters([]);
        setSubs([]);
      }
    } else {
      setGameData(null);
      setStarters([]);
      setSubs([]);
    }
  }, [selectedGameId, fetchGameData]);

  // Persist lineup to localStorage whenever it changes
  useEffect(() => {
    if (selectedGameId && (starters.length > 0 || subs.length > 0)) {
      localStorage.setItem(`lineup-${selectedGameId}`, JSON.stringify({ starters, subs }));
    }
  }, [selectedGameId, starters, subs]);

  // Active players = starters + subs (in order)
  const activePlayers = [
    ...starters.map((id) => players.find((p) => p.id === id)).filter(Boolean),
    ...subs.map((id) => players.find((p) => p.id === id)).filter(Boolean),
  ] as Player[];

  // Available players not yet in starters or subs
  const availableForStarter = players.filter((p) => !starters.includes(p.id) && !subs.includes(p.id));
  const availableForSub = players.filter((p) => !starters.includes(p.id) && !subs.includes(p.id));

  function setStarterSlot(index: number, playerId: string) {
    const next = [...starters];
    // If this player was already in a different starter slot, swap
    const existingIdx = next.indexOf(playerId);
    if (existingIdx !== -1 && existingIdx !== index) {
      next[existingIdx] = next[index] || "";
    }
    next[index] = playerId;
    setStarters(next.filter(Boolean));
  }

  function removeStarter(playerId: string) {
    setStarters(starters.filter((id) => id !== playerId));
  }

  function addSub(playerId: string) {
    if (!subs.includes(playerId)) setSubs([...subs, playerId]);
    setShowSubPicker(false);
  }

  function removeSub(playerId: string) {
    setSubs(subs.filter((id) => id !== playerId));
  }

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

  /* ── edit game handler ── */
  async function handleEditGame(e: React.FormEvent) {
    e.preventDefault();
    if (!editGame.opponent.trim() || !editGame.date) return;
    const res = await fetch(`/api/games/${editGame.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ opponent: editGame.opponent, date: editGame.date, weekNumber: editGame.weekNumber }),
    });
    if (res.ok) {
      setShowEditGame(false);
      await fetchGames();
      if (selectedGameId === editGame.id) await fetchGameData(editGame.id);
    }
  }

  function openEditGame(g: Game) {
    setEditGame({
      id: g.id,
      opponent: g.opponent,
      date: new Date(g.date).toISOString().split("T")[0],
      weekNumber: g.weekNumber,
    });
    setShowEditGame(true);
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
    newPlayRef.current?.focus();
    await fetchGameData(selectedGameId);
  }

  async function handleDeleteSnap(snapId: string) {
    if (!selectedGameId) return;
    await fetch(`/api/games/${selectedGameId}/snaps/${snapId}`, { method: "DELETE" });
    await fetchGameData(selectedGameId);
  }

  async function handleGradeChange(snapId: string, playerId: string, value: number | null) {
    if (!selectedGameId) return;
    const snap = gameData?.snaps.find((s) => s.id === snapId);
    // Fire-and-forget so navigation isn't blocked
    fetch(`/api/games/${selectedGameId}/snaps/${snapId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        playName: snap?.playName || "",
        grades: [{ playerId, value }],
      }),
    }).then(() => { if (selectedGameId) fetchGameData(selectedGameId); });
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

  async function handleSnapFieldChange(snapId: string, field: string, value: string | number) {
    if (!selectedGameId) return;
    const snap = gameData?.snaps.find((s) => s.id === snapId);
    await fetch(`/api/games/${selectedGameId}/snaps/${snapId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ playName: snap?.playName || "", [field]: value }),
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
    await fetchGameData(selectedGameId);
  }

  /* ── grade cell navigation (Tab support) ── */
  function getAdjacentCell(snapId: string, playerId: string, direction: 1 | -1): string | null {
    if (!gameData) return null;
    const snaps = gameData.snaps;
    const snapIdx = snaps.findIndex((s) => s.id === snapId);
    const playerIdx = activePlayers.findIndex((p) => p.id === playerId);
    if (snapIdx === -1 || playerIdx === -1) return null;

    let nextPlayerIdx = playerIdx + direction;
    let nextSnapIdx = snapIdx;

    if (nextPlayerIdx >= activePlayers.length) {
      nextPlayerIdx = 0;
      nextSnapIdx += 1;
    } else if (nextPlayerIdx < 0) {
      nextPlayerIdx = activePlayers.length - 1;
      nextSnapIdx -= 1;
    }

    if (nextSnapIdx < 0 || nextSnapIdx >= snaps.length) return null;
    return `${snaps[nextSnapIdx].id}-${activePlayers[nextPlayerIdx].id}`;
  }

  /* ── summary calculations ── */
  function calcStats(playerId: string, playTypeFilter?: string) {
    if (!gameData) return { snaps: 0, jobPct: 0, techPct: 0, totalPct: 0 };
    const snaps = playTypeFilter
      ? gameData.snaps.filter((s) => s.playType === playTypeFilter)
      : gameData.snaps;
    const grades = snaps
      .flatMap((s) => s.grades)
      .filter((g) => g.playerId === playerId);
    const total = grades.length;
    if (total === 0) return { snaps: 0, jobPct: 0, techPct: 0, totalPct: 0 };

    const jobCount = grades.filter((g) => isJobPositive(g.value)).length;
    const techCount = grades.filter((g) => isTechPositive(g.value)).length;
    const jobPct = Math.round((jobCount / total) * 100);
    const techPct = Math.round((techCount / total) * 100);
    const totalPct = Math.round(((jobCount + techCount) / (total * 2)) * 100);

    return { snaps: total, jobPct, techPct, totalPct };
  }

  function getPlayerStats(playerId: string): GamePlayerStatsData | undefined {
    return gameData?.playerStats.find((s) => s.playerId === playerId);
  }

  /* ── no players state ── */
  if (players.length === 0) {
    return (
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">Grades</h1>
        <div className="bg-white/[0.04] border border-white/[0.08] rounded-md p-12 text-center">
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
          <h1 className="text-4xl font-bold text-white">OL Grades</h1>
          <p className="text-sm text-white/40">Play-by-play grading &amp; summary stats</p>
        </div>
      </div>

      {/* Game selector */}
      <div className="bg-white/[0.04] border border-white/[0.08] rounded-md px-4 py-3 mb-4 flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <label className="text-xs text-white/40">Game</label>
          <select
            value={selectedGameId || ""}
            onChange={(e) => {
              const v = e.target.value;
              if (v === "__add__") { setShowNewGame(true); return; }
              setSelectedGameId(v || null);
            }}
            className="bg-white/[0.06] border border-white/[0.08] rounded-sm px-3 py-2 text-sm text-white focus:ring-1 focus:ring-white/20 focus:outline-none min-w-[260px]"
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

      {/* Game cards row */}
      {games.length > 0 && (
        <div className="flex items-center gap-3 mb-6 overflow-x-auto pb-1">
          {games.map((g) => (
            <div
              key={g.id}
              className={`group relative flex-shrink-0 px-4 py-3 rounded-md border text-left transition-all duration-150 cursor-pointer ${
                selectedGameId === g.id
                  ? "bg-primary-500/20 border-primary-400/40 text-white"
                  : "bg-white/[0.04] border-white/[0.08] text-white/60 hover:bg-white/[0.06] hover:border-white/[0.15]"
              }`}
              onClick={() => setSelectedGameId(g.id)}
            >
              <button
                onClick={(e) => { e.stopPropagation(); openEditGame(g); }}
                className="absolute top-1.5 right-1.5 p-1 rounded text-white/20 hover:text-white/60 hover:bg-white/[0.08] opacity-0 group-hover:opacity-100 transition-all duration-150"
                title="Edit game"
              >
                <Pencil size={12} />
              </button>
              <div className="text-xs font-bold uppercase tracking-wide">Game {g.weekNumber}</div>
              <div className="text-sm font-semibold mt-0.5">vs {g.opponent}</div>
              <div className="text-[10px] text-white/40 mt-0.5">{new Date(g.date).toLocaleDateString()}</div>
            </div>
          ))}
          <button
            onClick={() => setShowNewGame(true)}
            className="flex-shrink-0 px-4 py-3 rounded-md border border-dashed border-white/[0.12] text-white/30 hover:text-white/60 hover:border-white/[0.20] transition-all duration-150 flex items-center gap-2"
          >
            <Plus size={14} />
            <span className="text-xs font-medium">New Game</span>
          </button>
        </div>
      )}

      {/* Player Summary (shows when a game is selected) */}
      {selectedGameId && (
        <div className="bg-white/[0.04] border border-white/[0.08] rounded-md overflow-x-auto mb-6">
          <div className="px-4 py-3 border-b border-white/[0.08]">
            <h3 className="text-sm font-bold text-white">Players — Game Summary</h3>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.08] bg-white/[0.02]">
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
              {activePlayers.map((p) => {
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
                    <tr className={`border-t border-white/[0.05] ${hasGrades ? "" : "opacity-40"}`}>
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
                    <tr className="border-b-2 border-white/[0.08] bg-white/[0.02]">
                      <td className="px-3 py-1.5 text-xs font-bold text-white">TOTAL</td>
                      <td className="text-center px-2 py-1.5 text-xs font-bold text-white">{total.snaps}</td>
                      {statCell(total.jobPct, total.snaps)}
                      {statCell(total.techPct, total.snaps)}
                      {statCell(total.totalPct, total.snaps)}
                      {(["sacks", "missedAssignments", "penalties", "pressures", "badSnaps", "knockdowns", "da"] as const).map((field) => {
                        const ps = getPlayerStats(p.id);
                        const val = ps ? ps[field] : 0;
                        return (
                          <td key={field} className="text-center px-1 py-1">
                            <input
                              type="number"
                              min={0}
                              defaultValue={val}
                              onBlur={(e) => {
                                const nv = parseInt(e.target.value) || 0;
                                if (nv !== val) handleStatChange(p.id, field, nv);
                              }}
                              className="w-10 bg-transparent border border-white/[0.08] rounded-sm text-center text-xs text-white py-0.5 focus:ring-1 focus:ring-white/20 focus:outline-none"
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
        <div className="bg-white/[0.04] border border-white/[0.08] rounded-md p-12 text-center">
          <p className="text-sm text-white/40 mb-4">Select or create a game to start grading.</p>
          <button onClick={() => setShowNewGame(true)}
            className="bg-primary-500 text-white px-6 py-2 rounded text-sm font-semibold hover:bg-primary-600 transition-colors duration-150">
            Create Game
          </button>
        </div>
      )}

      {/* Game grading view */}
      {gameData && (
        <>
          {/* Game header */}
          <div className="bg-white/[0.04] rounded-md p-5 border border-white/[0.08] mb-6">
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

          {/* Lineup Picker — Starting 5 + Subs */}
          <div className="bg-white/[0.04] border border-white/[0.08] rounded-md p-4 mb-4">
            <div className="flex items-start gap-8">
              {/* Starting 5 */}
              <div className="flex-1">
                <h3 className="text-xs font-bold text-white/60 uppercase tracking-wider mb-3">Starting 5</h3>
                <div className="flex items-center gap-2 flex-wrap">
                  {(["LT", "LG", "C", "RG", "RT"] as const).map((posLabel, slot) => {
                    const starterId = starters[slot];
                    const starterPlayer = starterId ? players.find((p) => p.id === starterId) : null;
                    return (
                      <div key={slot} className="relative">
                        {starterPlayer ? (
                          <div className="flex items-center gap-1.5 bg-primary-500/20 border border-primary-400/30 rounded px-3 py-1.5">
                            <span className="text-[10px] font-bold text-primary-300 mr-0.5">{posLabel}</span>
                            <span className="text-xs font-bold text-white">#{starterPlayer.number}</span>
                            <span className="text-xs text-white/70">{starterPlayer.name}</span>
                            <button onClick={() => removeStarter(starterId)} className="ml-1 text-white/30 hover:text-red-400 transition-colors"><X size={12} /></button>
                          </div>
                        ) : (
                          <select
                            value=""
                            onChange={(e) => { if (e.target.value) setStarterSlot(slot, e.target.value); }}
                            className="bg-[#1a1a1a] border border-dashed border-white/[0.15] rounded px-3 py-1.5 text-xs text-white/40 focus:ring-1 focus:ring-white/20 focus:outline-none min-w-[140px]"
                          >
                            <option value="" className="bg-[#1a1a1a] text-white/40">{posLabel} — Select...</option>
                            {availableForStarter.map((p) => (
                              <option key={p.id} value={p.id} className="bg-[#1a1a1a] text-white">#{p.number} {p.name} ({p.position})</option>
                            ))}
                          </select>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Subs */}
              <div className="min-w-[200px]">
                <h3 className="text-xs font-bold text-white/60 uppercase tracking-wider mb-3">Subs</h3>
                <div className="flex items-center gap-2 flex-wrap">
                  {subs.map((subId) => {
                    const subPlayer = players.find((p) => p.id === subId);
                    if (!subPlayer) return null;
                    return (
                      <div key={subId} className="flex items-center gap-1.5 bg-white/[0.06] border border-white/[0.10] rounded px-3 py-1.5">
                        <span className="text-xs font-bold text-white">#{subPlayer.number}</span>
                        <span className="text-xs text-white/70">{subPlayer.name}</span>
                        <button onClick={() => removeSub(subId)} className="ml-1 text-white/30 hover:text-red-400 transition-colors"><X size={12} /></button>
                      </div>
                    );
                  })}
                  {availableForSub.length > 0 && (
                    showSubPicker ? (
                      <select
                        autoFocus
                        value=""
                        onChange={(e) => { if (e.target.value) addSub(e.target.value); }}
                        onBlur={() => setShowSubPicker(false)}
                        className="bg-[#1a1a1a] border border-white/[0.10] rounded px-2 py-1.5 text-xs text-white focus:ring-1 focus:ring-white/20 focus:outline-none"
                      >
                        <option value="" className="bg-[#1a1a1a] text-white/40">Pick sub...</option>
                        {availableForSub.map((p) => (
                          <option key={p.id} value={p.id} className="bg-[#1a1a1a] text-white">#{p.number} {p.name} ({p.position})</option>
                        ))}
                      </select>
                    ) : (
                      <button
                        onClick={() => setShowSubPicker(true)}
                        className="flex items-center gap-1 border border-dashed border-white/[0.12] rounded px-2.5 py-1.5 text-xs text-white/30 hover:text-white/60 hover:border-white/[0.20] transition-all"
                      >
                        <Plus size={12} /> Add Sub
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Grading table */}
          <div className="bg-white/[0.04] border border-white/[0.08] rounded-md overflow-x-auto mb-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.08] bg-white/[0.02]">
                  <th className="text-center px-2 py-2 text-xs text-white/40 font-medium w-10">#</th>
                  <th className="text-left px-2 py-2 text-xs text-white/40 font-medium min-w-[140px]">PLAY</th>
                  <th className="text-center px-2 py-2 text-xs text-white/40 font-medium w-16">Run/Pass</th>
                  <th className="text-left px-2 py-2 text-xs text-white/40 font-medium min-w-[120px]">SCHEME</th>
                  {activePlayers.map((p, i) => (
                    <th key={p.id} className={`text-center px-1 py-2 text-xs text-white/40 font-medium min-w-[55px] ${i === starters.length ? "border-l-2 border-white/[0.15]" : ""}`}>
                      <div className="text-white/60">{p.position}</div>
                      <div className="text-white font-bold">#{p.number}</div>
                    </th>
                  ))}
                  <th className="text-center px-1 py-2 text-xs text-white/40 font-medium min-w-[40px]">TE</th>
                  <th className="text-center px-1 py-2 text-xs text-white/40 font-medium min-w-[50px]">XTKL-</th>
                  <th className="text-center px-1 py-2 text-xs text-white/40 font-medium min-w-[55px]">2XTKL-</th>
                  <th className="text-left px-2 py-2 text-xs text-white/40 font-medium min-w-[180px]">COMMENTS/RESULTS</th>
                  <th className="w-8"></th>
                </tr>
              </thead>
              <tbody>
                {gameData.snaps.map((snap) => (
                  <tr key={snap.id} className="border-b border-white/[0.05] hover:bg-white/[0.03]">
                    <td className="text-center px-2 py-1.5 text-xs text-white/40 font-mono">{snap.snapNumber}</td>
                    <td className="px-2 py-1.5 font-medium text-white text-xs uppercase">{snap.playName}</td>
                    <td className="px-1 py-1 text-center">
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
                        className="bg-transparent border border-white/[0.08] rounded-sm text-xs text-white/50 focus:ring-1 focus:ring-white/20 focus:outline-none py-0.5 px-1"
                      >
                        <option value="run">Run</option>
                        <option value="pass">Pass</option>
                        <option value="draw-screen">Draw</option>
                      </select>
                    </td>
                    <td className="px-2 py-1">
                      <input
                        type="text"
                        defaultValue={snap.scheme}
                        onBlur={(e) => {
                          if (e.target.value !== snap.scheme) handleSnapFieldChange(snap.id, "scheme", e.target.value);
                        }}
                        className="w-full bg-transparent border-none text-xs text-white/50 focus:text-white focus:outline-none focus:ring-1 focus:ring-white/20 rounded px-1 py-0.5"
                        placeholder="..."
                      />
                    </td>
                    {activePlayers.map((p, i) => {
                      const grade = snap.grades.find((g) => g.playerId === p.id);
                      const cellKey = `${snap.id}-${p.id}`;
                      const isEditing = editingCell === cellKey;

                      return (
                        <td key={p.id} className={`text-center px-1 py-1 ${grade ? gradeBg(grade.value) : ""} ${i === starters.length ? "border-l-2 border-white/[0.15]" : ""}`}>
                          {isEditing ? (
                            <div
                              tabIndex={0}
                              data-grade-cell={cellKey}
                              onKeyDown={(e) => {
                                if (["1", "2", "3", "4"].includes(e.key)) {
                                  e.preventDefault();
                                  handleGradeChange(snap.id, p.id, parseInt(e.key));
                                  const next = getAdjacentCell(snap.id, p.id, 1);
                                  setEditingCell(next);
                                } else if (e.key === "Tab") {
                                  e.preventDefault();
                                  const dir = e.shiftKey ? -1 : 1;
                                  const next = getAdjacentCell(snap.id, p.id, dir);
                                  setEditingCell(next);
                                } else if (e.key === "Escape") {
                                  setEditingCell(null);
                                } else if (e.key === "Backspace" || e.key === "Delete") {
                                  handleGradeChange(snap.id, p.id, null);
                                  setEditingCell(null);
                                }
                              }}
                              className="w-10 h-8 mx-auto rounded ring-2 ring-primary-400 bg-white/[0.08] flex items-center justify-center text-xs font-bold text-white cursor-text outline-none"
                            >
                              {grade ? grade.value : "·"}
                            </div>
                          ) : (
                            <button
                              data-grade-btn
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
                    <td className="text-center px-1 py-1">
                      <input
                        type="number"
                        min={0}
                        defaultValue={snap.te || ""}
                        onBlur={(e) => {
                          const nv = parseInt(e.target.value) || 0;
                          if (nv !== snap.te) handleSnapFieldChange(snap.id, "te", nv);
                        }}
                        className="w-10 bg-transparent border border-white/[0.08] rounded-sm text-center text-xs text-white py-0.5 focus:ring-1 focus:ring-white/20 focus:outline-none"
                      />
                    </td>
                    <td className="text-center px-1 py-1">
                      <input
                        type="number"
                        min={0}
                        defaultValue={snap.xtkl || ""}
                        onBlur={(e) => {
                          const nv = parseInt(e.target.value) || 0;
                          if (nv !== snap.xtkl) handleSnapFieldChange(snap.id, "xtkl", nv);
                        }}
                        className="w-10 bg-transparent border border-white/[0.08] rounded-sm text-center text-xs text-white py-0.5 focus:ring-1 focus:ring-white/20 focus:outline-none"
                      />
                    </td>
                    <td className="text-center px-1 py-1">
                      <input
                        type="number"
                        min={0}
                        defaultValue={snap.xtkl2 || ""}
                        onBlur={(e) => {
                          const nv = parseInt(e.target.value) || 0;
                          if (nv !== snap.xtkl2) handleSnapFieldChange(snap.id, "xtkl2", nv);
                        }}
                        className="w-10 bg-transparent border border-white/[0.08] rounded-sm text-center text-xs text-white py-0.5 focus:ring-1 focus:ring-white/20 focus:outline-none"
                      />
                    </td>
                    <td className="px-2 py-1">
                      <input
                        type="text"
                        defaultValue={snap.comment}
                        onBlur={(e) => {
                          if (e.target.value !== snap.comment) handleCommentChange(snap.id, e.target.value);
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
                <tr className="bg-white/[0.02] border-t border-white/[0.05]">
                  <td className="px-2 py-2 text-xs text-white/40 text-center">{(gameData.snaps.length || 0) + 1}</td>
                  <td className="px-2 py-2" colSpan={activePlayers.length + 7}>
                    <form onSubmit={handleAddSnap} className="flex items-center gap-2">
                      <input
                        ref={newPlayRef}
                        type="text"
                        value={newPlayName}
                        onChange={(e) => setNewPlayName(e.target.value)}
                        placeholder="Play name (e.g. RED WAGON)..."
                        className="flex-1 bg-white/[0.06] border border-white/[0.08] rounded-sm px-3 py-1.5 text-xs text-white uppercase focus:ring-1 focus:ring-white/20 focus:outline-none placeholder:normal-case"
                      />
                      <select
                        value={newPlayType}
                        onChange={(e) => setNewPlayType(e.target.value)}
                        className="bg-white/[0.06] border border-white/[0.08] rounded-sm px-2 py-1.5 text-xs text-white focus:ring-1 focus:ring-white/20 focus:outline-none"
                      >
                        <option value="run">Run</option>
                        <option value="pass">Pass</option>
                        <option value="draw-screen">Draw</option>
                      </select>
                      <button type="submit" className="bg-primary-500 text-white px-3 py-1.5 rounded-sm text-xs font-semibold hover:bg-primary-600 transition-colors duration-150 flex items-center gap-1">
                        <Plus size={12} /> Add
                      </button>
                    </form>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* ── Summary Stats ── */}
          <div className="bg-white/[0.04] border border-white/[0.08] rounded-md overflow-x-auto mb-6">
            <div className="px-4 py-3 border-b border-white/[0.08]">
              <h3 className="text-sm font-bold text-white">GRADE SUMMARY</h3>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.08] bg-white/[0.02]">
                  <th className="text-left px-4 py-2 text-xs text-white/40 font-medium min-w-[140px]">STAT</th>
                  {activePlayers.map((p) => (
                    <th key={p.id} className="text-center px-2 py-2 text-xs font-bold text-white min-w-[80px]">
                      #{p.number}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Snaps */}
                <tr className="border-b border-white/[0.05]">
                  <td className="px-4 py-2 font-medium text-white text-xs">SNAPS</td>
                  {activePlayers.map((p) => {
                    const s = calcStats(p.id);
                    return <td key={p.id} className="text-center px-2 py-2 text-xs text-white">{s.snaps}</td>;
                  })}
                </tr>
                {/* Job % */}
                <tr className="border-b border-white/[0.05]">
                  <td className="px-4 py-2 font-medium text-white text-xs">JOB %</td>
                  {activePlayers.map((p) => {
                    const s = calcStats(p.id);
                    return (
                      <td key={p.id} className={`text-center px-2 py-2 text-xs font-bold ${s.jobPct >= 80 ? "text-green-400" : s.jobPct >= 60 ? "text-yellow-400" : "text-red-500"}`}>
                        {s.snaps > 0 ? `${s.jobPct}%` : "—"}
                      </td>
                    );
                  })}
                </tr>
                {/* Tech % */}
                <tr className="border-b border-white/[0.05]">
                  <td className="px-4 py-2 font-medium text-white text-xs">TECH %</td>
                  {activePlayers.map((p) => {
                    const s = calcStats(p.id);
                    return (
                      <td key={p.id} className={`text-center px-2 py-2 text-xs font-bold ${s.techPct >= 80 ? "text-green-400" : s.techPct >= 60 ? "text-yellow-400" : "text-red-500"}`}>
                        {s.snaps > 0 ? `${s.techPct}%` : "—"}
                      </td>
                    );
                  })}
                </tr>
                {/* Final % */}
                <tr className="border-b border-white/[0.08] bg-white/[0.02]">
                  <td className="px-4 py-2 font-bold text-white text-xs">FINAL %</td>
                  {activePlayers.map((p) => {
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
              className="w-full bg-white/[0.06] border border-white/[0.08] rounded-sm px-4 py-3 text-sm text-white focus:ring-1 focus:ring-white/20 focus:outline-none"
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
                className="w-full bg-white/[0.06] border border-white/[0.08] rounded-sm px-4 py-3 text-sm text-white focus:ring-1 focus:ring-white/20 focus:outline-none"
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
                className="w-full bg-white/[0.06] border border-white/[0.08] rounded-sm px-4 py-3 text-sm text-white focus:ring-1 focus:ring-white/20 focus:outline-none"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-2">
            <button type="button" onClick={() => setShowNewGame(false)}
              className="px-5 py-2 text-sm text-white/40 hover:text-white transition-colors duration-150">Cancel</button>
            <button type="submit"
              className="bg-primary-500 text-white px-6 py-2 rounded text-sm font-semibold hover:bg-primary-600 transition-colors duration-150">Create Game</button>
          </div>
        </form>
      </Modal>

      {/* Edit Game Modal */}
      <Modal open={showEditGame} onClose={() => setShowEditGame(false)} title="Edit Game">
        <form onSubmit={handleEditGame} className="space-y-4">
          <div>
            <label className="block text-xs text-white/40 mb-2">Opponent *</label>
            <input
              type="text"
              value={editGame.opponent}
              onChange={(e) => setEditGame({ ...editGame, opponent: e.target.value })}
              className="w-full bg-white/[0.06] border border-white/[0.08] rounded-sm px-4 py-3 text-sm text-white focus:ring-1 focus:ring-white/20 focus:outline-none"
              autoFocus required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-white/40 mb-2">Date *</label>
              <input
                type="date"
                value={editGame.date}
                onChange={(e) => setEditGame({ ...editGame, date: e.target.value })}
                className="w-full bg-white/[0.06] border border-white/[0.08] rounded-sm px-4 py-3 text-sm text-white focus:ring-1 focus:ring-white/20 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-2">Game #</label>
              <input
                type="number"
                min={1}
                value={editGame.weekNumber}
                onChange={(e) => setEditGame({ ...editGame, weekNumber: parseInt(e.target.value) || 1 })}
                className="w-full bg-white/[0.06] border border-white/[0.08] rounded-sm px-4 py-3 text-sm text-white focus:ring-1 focus:ring-white/20 focus:outline-none"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-2">
            <button type="button" onClick={() => setShowEditGame(false)}
              className="px-5 py-2 text-sm text-white/40 hover:text-white transition-colors duration-150">Cancel</button>
            <button type="submit"
              className="bg-primary-500 text-white px-6 py-2 rounded text-sm font-semibold hover:bg-primary-600 transition-colors duration-150">Save Changes</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
