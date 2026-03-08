"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Plus, Trash2, X, Star, ChevronDown } from "lucide-react";

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

/* ── Modal ─────────────────────────────────────────── */
function Modal({ open, onClose, title, children }: {
  open: boolean; onClose: () => void; title: string; children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-primary-500/30 rounded-xl shadow-2xl w-full max-w-md mx-4 p-6 z-10">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-foreground">{title}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X size={20} /></button>
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
    default: return "text-muted-foreground";
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

  // New snap row
  const [newPlayName, setNewPlayName] = useState("");
  const [newPlayType, setNewPlayType] = useState("run");
  const newPlayRef = useRef<HTMLInputElement>(null);

  // Inline editing
  const [editingCell, setEditingCell] = useState<string | null>(null); // "snapId-playerId"

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
    if (selectedGameId) fetchGameData(selectedGameId);
    else setGameData(null);
  }, [selectedGameId, fetchGameData]);

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
    await fetchGameData(selectedGameId);
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
        <h1 className="text-2xl font-bold text-foreground mb-2">Grades</h1>
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <Star size={48} className="mx-auto text-muted-foreground mb-4" />
          <p className="text-sm text-muted-foreground">Add players to your roster first before grading.</p>
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
          <h1 className="text-2xl font-bold text-foreground">OL Grades</h1>
          <p className="text-sm text-muted-foreground">Play-by-play grading &amp; summary stats</p>
        </div>
      </div>

      {/* Game selector */}
      <div className="bg-card border border-border rounded-lg px-4 py-3 mb-6 flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <label className="text-xs text-muted-foreground">Game</label>
          <select
            value={selectedGameId || ""}
            onChange={(e) => {
              const v = e.target.value;
              if (v === "__add__") { setShowNewGame(true); return; }
              setSelectedGameId(v || null);
            }}
            className="bg-muted border border-border rounded-md px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary-500 focus:outline-none min-w-[260px]"
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
        <div className="bg-card border border-border rounded-lg overflow-x-auto mb-6">
          <div className="px-4 py-3 border-b border-border">
            <h3 className="text-sm font-bold text-foreground">Players — Game Summary</h3>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-2 text-xs text-muted-foreground font-medium min-w-[140px]">PLAYER</th>
                <th className="text-left px-3 py-2 text-xs text-muted-foreground font-medium w-16"></th>
                <th className="text-center px-2 py-2 text-xs text-muted-foreground font-medium min-w-[55px]">SNAPS</th>
                <th className="text-center px-2 py-2 text-xs text-muted-foreground font-medium min-w-[65px]">JOB %</th>
                <th className="text-center px-2 py-2 text-xs text-muted-foreground font-medium min-w-[65px]">TECH %</th>
                <th className="text-center px-2 py-2 text-xs text-muted-foreground font-medium min-w-[65px]">FINAL %</th>
                <th className="text-center px-1 py-2 text-xs text-muted-foreground font-medium min-w-[50px]">SACKS</th>
                <th className="text-center px-1 py-2 text-xs text-muted-foreground font-medium min-w-[50px]">MA's</th>
                <th className="text-center px-1 py-2 text-xs text-muted-foreground font-medium min-w-[65px]">PEN</th>
                <th className="text-center px-1 py-2 text-xs text-muted-foreground font-medium min-w-[65px]">PRESS</th>
                <th className="text-center px-1 py-2 text-xs text-muted-foreground font-medium min-w-[60px]">B.SNAP</th>
                <th className="text-center px-1 py-2 text-xs text-muted-foreground font-medium min-w-[55px]">KD</th>
                <th className="text-center px-1 py-2 text-xs text-muted-foreground font-medium min-w-[45px]">DA</th>
              </tr>
            </thead>
            <tbody>
              {players.map((p) => {
                const run = calcStats(p.id, "run");
                const pass = calcStats(p.id, "pass");
                const total = calcStats(p.id);
                const hasGrades = total.snaps > 0;

                function statCell(val: number, snaps: number) {
                  if (snaps === 0) return <td className="text-center px-2 py-1.5 text-xs text-muted-foreground/40">—</td>;
                  const cls = val >= 80 ? "text-green-400" : val >= 60 ? "text-yellow-400" : "text-red-500";
                  return <td className={`text-center px-2 py-1.5 text-xs font-bold ${cls}`}>{val}%</td>;
                }

                return (
                  <React.Fragment key={p.id}>
                    {/* RUN row */}
                    <tr className={`border-t border-border/50 ${hasGrades ? "" : "opacity-40"}`}>
                      <td className="px-4 py-1.5 font-medium text-foreground text-xs" rowSpan={3}>
                        <div className="font-semibold">{p.name}</div>
                        <div className="text-muted-foreground">{p.position} #{p.number}</div>
                      </td>
                      <td className="px-3 py-1.5 text-xs font-medium text-blue-400">RUN</td>
                      <td className="text-center px-2 py-1.5 text-xs text-foreground">{run.snaps}</td>
                      {statCell(run.jobPct, run.snaps)}
                      {statCell(run.techPct, run.snaps)}
                      {statCell(run.totalPct, run.snaps)}
                      <td colSpan={7}></td>
                    </tr>
                    {/* PASS row */}
                    <tr>
                      <td className="px-3 py-1.5 text-xs font-medium text-purple-400">PASS</td>
                      <td className="text-center px-2 py-1.5 text-xs text-foreground">{pass.snaps}</td>
                      {statCell(pass.jobPct, pass.snaps)}
                      {statCell(pass.techPct, pass.snaps)}
                      {statCell(pass.totalPct, pass.snaps)}
                      <td colSpan={7}></td>
                    </tr>
                    {/* TOTAL row — includes editable stats */}
                    <tr className="border-b-2 border-border bg-muted/10">
                      <td className="px-3 py-1.5 text-xs font-bold text-foreground">TOTAL</td>
                      <td className="text-center px-2 py-1.5 text-xs font-bold text-foreground">{total.snaps}</td>
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
                              className="w-10 bg-transparent border border-border/50 rounded text-center text-xs text-foreground py-0.5 focus:ring-1 focus:ring-primary-500 focus:outline-none"
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
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <p className="text-sm text-muted-foreground mb-4">Select or create a game to start grading.</p>
          <button onClick={() => setShowNewGame(true)}
            className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-md text-sm font-medium transition-colors">
            Create Game
          </button>
        </div>
      )}

      {/* Game grading view */}
      {gameData && (
        <>
          {/* Game header */}
          <div className="bg-gradient-to-r from-primary-900/60 via-primary-800/40 to-background rounded-xl p-5 border border-primary-800/30 mb-6">
            <h2 className="text-xl font-bold text-foreground">
              Game {gameData.weekNumber} — vs {gameData.opponent}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Date: {new Date(gameData.date).toLocaleDateString()} · {gameData.snaps.length} snaps graded
            </p>
          </div>

          {/* KEY legend */}
          <div className="flex items-center gap-4 mb-4 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">KEY:</span>
            <span><span className="text-green-400 font-bold">4</span>=(+)(+)</span>
            <span><span className="text-yellow-400 font-bold">3</span>=(+)(-)</span>
            <span><span className="text-orange-400 font-bold">2</span>=(-)(+)</span>
            <span><span className="text-red-500 font-bold">1</span>=(-)(-)  </span>
            <span className="ml-2 text-foreground/60">Job / Technique</span>
          </div>

          {/* Grading table */}
          <div className="bg-card border border-border rounded-lg overflow-x-auto mb-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-3 py-2 text-xs text-muted-foreground font-medium w-10">#</th>
                  <th className="text-left px-3 py-2 text-xs text-muted-foreground font-medium w-16">TYPE</th>
                  <th className="text-left px-3 py-2 text-xs text-muted-foreground font-medium min-w-[160px]">PLAY</th>
                  {players.map((p) => (
                    <th key={p.id} className="text-center px-2 py-2 text-xs text-muted-foreground font-medium min-w-[60px]">
                      <div>{p.position}</div>
                      <div className="text-foreground font-bold">#{p.number}</div>
                    </th>
                  ))}
                  <th className="text-left px-3 py-2 text-xs text-muted-foreground font-medium min-w-[140px]">COMMENTS</th>
                  <th className="w-8"></th>
                </tr>
              </thead>
              <tbody>
                {gameData.snaps.map((snap) => (
                  <tr key={snap.id} className="border-b border-border/30 hover:bg-muted/20">
                    <td className="px-3 py-1.5 text-xs text-muted-foreground">{snap.snapNumber}</td>
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
                        className="bg-transparent border border-border/40 rounded text-xs text-muted-foreground focus:ring-1 focus:ring-primary-500 focus:outline-none py-0.5 px-1"
                      >
                        <option value="run">Run</option>
                        <option value="pass">Pass</option>
                        <option value="draw-screen">Draw</option>
                      </select>
                    </td>
                    <td className="px-3 py-1.5 font-medium text-foreground text-xs uppercase">{snap.playName}</td>
                    {players.map((p) => {
                      const grade = snap.grades.find((g) => g.playerId === p.id);
                      const cellKey = `${snap.id}-${p.id}`;
                      const isEditing = editingCell === cellKey;

                      return (
                        <td key={p.id} className={`text-center px-1 py-1 ${grade ? gradeBg(grade.value) : ""}`}>
                          {isEditing ? (
                            <select
                              autoFocus
                              defaultValue={grade?.value || 0}
                              onChange={(e) => {
                                const val = parseInt(e.target.value);
                                handleGradeChange(snap.id, p.id, val || null);
                              }}
                              onBlur={() => setEditingCell(null)}
                              className="w-12 bg-muted border border-primary-500 rounded px-1 py-0.5 text-xs text-foreground text-center focus:outline-none"
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
                              className={`w-8 h-7 rounded text-xs font-bold cursor-pointer hover:ring-1 hover:ring-primary-500 transition-all ${
                                grade ? gradeColor(grade.value) : "text-muted-foreground/30"
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
                        className="w-full bg-transparent border-none text-xs text-muted-foreground focus:text-foreground focus:outline-none focus:ring-1 focus:ring-primary-500/30 rounded px-1 py-0.5"
                        placeholder="..."
                      />
                    </td>
                    <td className="px-1 py-1">
                      <button
                        onClick={() => handleDeleteSnap(snap.id)}
                        className="text-muted-foreground/30 hover:text-accent-500 transition-colors"
                      >
                        <Trash2 size={12} />
                      </button>
                    </td>
                  </tr>
                ))}

                {/* Add new snap row */}
                <tr className="bg-muted/10">
                  <td className="px-3 py-2 text-xs text-muted-foreground">{(gameData.snaps.length || 0) + 1}</td>
                  <td className="px-3 py-2" colSpan={players.length + 3}>
                    <form onSubmit={handleAddSnap} className="flex items-center gap-2">
                      <select
                        value={newPlayType}
                        onChange={(e) => setNewPlayType(e.target.value)}
                        className="bg-muted border border-border rounded px-2 py-1.5 text-xs text-foreground focus:ring-1 focus:ring-primary-500 focus:outline-none"
                      >
                        <option value="run">Run</option>
                        <option value="pass">Pass</option>
                        <option value="draw-screen">Draw</option>
                      </select>
                      <input
                        ref={newPlayRef}
                        type="text"
                        value={newPlayName}
                        onChange={(e) => setNewPlayName(e.target.value)}
                        placeholder="Play name (e.g. RED WAGON)..."
                        className="flex-1 bg-muted border border-border rounded px-3 py-1.5 text-xs text-foreground uppercase focus:ring-2 focus:ring-primary-500 focus:outline-none placeholder:normal-case"
                      />
                      <button type="submit" className="bg-primary-500 hover:bg-primary-600 text-white px-3 py-1.5 rounded text-xs font-medium transition-colors flex items-center gap-1">
                        <Plus size={12} /> Add
                      </button>
                    </form>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* ── Summary Stats ── */}
          <div className="bg-card border border-border rounded-lg overflow-x-auto mb-6">
            <div className="px-4 py-3 border-b border-border">
              <h3 className="text-sm font-bold text-foreground">GRADE SUMMARY</h3>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-4 py-2 text-xs text-muted-foreground font-medium min-w-[140px]">STAT</th>
                  {players.map((p) => (
                    <th key={p.id} className="text-center px-2 py-2 text-xs font-bold text-foreground min-w-[80px]">
                      #{p.number}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Snaps */}
                <tr className="border-b border-border/30">
                  <td className="px-4 py-2 font-medium text-foreground text-xs">SNAPS</td>
                  {players.map((p) => {
                    const s = calcStats(p.id);
                    return <td key={p.id} className="text-center px-2 py-2 text-xs text-foreground">{s.snaps}</td>;
                  })}
                </tr>
                {/* Job % */}
                <tr className="border-b border-border/30">
                  <td className="px-4 py-2 font-medium text-foreground text-xs">JOB %</td>
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
                <tr className="border-b border-border/30">
                  <td className="px-4 py-2 font-medium text-foreground text-xs">TECH %</td>
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
                <tr className="border-b border-border bg-muted/20">
                  <td className="px-4 py-2 font-bold text-foreground text-xs">FINAL %</td>
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
            <label className="block text-xs text-muted-foreground mb-2">Opponent *</label>
            <input
              type="text"
              value={newGame.opponent}
              onChange={(e) => setNewGame({ ...newGame, opponent: e.target.value })}
              placeholder="e.g. Whitworth"
              className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-sm text-foreground focus:ring-2 focus:ring-primary-500 focus:outline-none"
              autoFocus required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-muted-foreground mb-2">Date *</label>
              <input
                type="date"
                value={newGame.date}
                onChange={(e) => setNewGame({ ...newGame, date: e.target.value })}
                className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-sm text-foreground focus:ring-2 focus:ring-primary-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-2">Game #</label>
              <input
                type="number"
                min={1}
                value={newGame.weekNumber}
                onChange={(e) => setNewGame({ ...newGame, weekNumber: parseInt(e.target.value) || 1 })}
                className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-sm text-foreground focus:ring-2 focus:ring-primary-500 focus:outline-none"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-2">
            <button type="button" onClick={() => setShowNewGame(false)}
              className="px-5 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
            <button type="submit"
              className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors">Create Game</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
