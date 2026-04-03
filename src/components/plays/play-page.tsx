"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Trash2,
  X,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";

interface Formation {
  id: string;
  name: string;
  category: string;
}

interface PlayCall {
  id: string;
  name: string;
  playId: string;
}

interface Play {
  id: string;
  name: string;
  category: string;
  down: string;
  distance: string;
  formationId: string;
  formation: Formation;
  playCalls: PlayCall[];
}

const DOWNS = ["any", "1st", "2nd", "3rd", "4th"];
const DISTANCES = ["any", "short", "medium", "long", "goal-line"];

function distanceLabel(d: string) {
  switch (d) {
    case "short": return "Short (1-3)";
    case "medium": return "Medium (4-6)";
    case "long": return "Long (7+)";
    case "goal-line": return "Goal Line";
    case "any": return "Any";
    default: return d;
  }
}

// --- Modal component ---
function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative backdrop-blur-xl bg-white/[0.08] border border-white/15 rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-6 z-10">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-white">{title}</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// --- Main component ---
interface PlayPageProps {
  category: "run" | "pass" | "draw-screen";
  title: string;
  icon: React.ReactNode;
}

export function PlayPage({ category, title, icon }: PlayPageProps) {
  const [formations, setFormations] = useState<Formation[]>([]);
  const [plays, setPlays] = useState<Play[]>([]);
  const [activeFormation, setActiveFormation] = useState<string>("all");

  // Modal states
  const [showFormationModal, setShowFormationModal] = useState(false);
  const [newFormationName, setNewFormationName] = useState("");
  const [showPlayModal, setShowPlayModal] = useState(false);
  const [playForm, setPlayForm] = useState({ name: "", down: "any", distance: "any", formationId: "" });

  // Detail view state
  const [selectedPlay, setSelectedPlay] = useState<Play | null>(null);
  const [newCallName, setNewCallName] = useState("");

  const fetchFormations = useCallback(async () => {
    const res = await fetch(`/api/formations`);
    if (res.ok) {
      const data: Formation[] = await res.json();
      // Defensive sort (API already orders by name)
      const sorted = [...data].sort((a, b) => a.name.localeCompare(b.name));
      setFormations(sorted);
    }
  }, []);

  const fetchPlays = useCallback(async () => {
    let url = `/api/plays?category=${category}`;
    if (activeFormation !== "all") url += `&formationId=${activeFormation}`;
    const res = await fetch(url);
    if (res.ok) {
      setPlays(await res.json());
    }
  }, [category, activeFormation]);

  useEffect(() => {
    fetchFormations();
  }, [fetchFormations]);

  useEffect(() => {
    fetchPlays();
  }, [fetchPlays]);

  // Keep active formation valid if formations list changes
  useEffect(() => {
    if (activeFormation === "all") return;
    if (formations.length === 0) {
      setActiveFormation("all");
      return;
    }
    const exists = formations.some((f) => f.id === activeFormation);
    if (!exists) setActiveFormation("all");
  }, [formations, activeFormation]);

  // --- Formation handlers ---
  async function handleAddFormation(e: React.FormEvent) {
    e.preventDefault();
    if (!newFormationName.trim()) return;
    const res = await fetch("/api/formations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newFormationName.trim() }),
    });
    if (res.ok) {
      const created = await res.json();
      setNewFormationName("");
      setShowFormationModal(false);
      await fetchFormations();
      setActiveFormation(created.id);
    }
  }

  async function handleDeleteFormation(id: string) {
    await fetch(`/api/formations/${id}`, { method: "DELETE" });
    if (activeFormation === id) setActiveFormation("all");
    await fetchFormations();
    await fetchPlays();
  }

  // --- Play handlers ---
  async function handleAddPlay(e: React.FormEvent) {
    e.preventDefault();
    const formationId = playForm.formationId || (activeFormation === "all" ? "" : activeFormation);
    if (!playForm.name.trim() || !formationId) return;
    const res = await fetch("/api/plays", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: playForm.name.trim(),
        formationId,
        category,
        down: playForm.down,
        distance: playForm.distance,
      }),
    });
    if (res.ok) {
      setPlayForm({ name: "", down: "any", distance: "any", formationId: "" });
      setShowPlayModal(false);
      await fetchPlays();
    }
  }

  async function handleDeletePlay(id: string) {
    await fetch(`/api/plays/${id}`, { method: "DELETE" });
    if (selectedPlay?.id === id) setSelectedPlay(null);
    await fetchPlays();
  }

  // --- Play Call handlers ---
  async function handleAddPlayCall(e: React.FormEvent) {
    e.preventDefault();
    if (!newCallName.trim() || !selectedPlay) return;
    const res = await fetch("/api/playcalls", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newCallName.trim(), playId: selectedPlay.id }),
    });
    if (res.ok) {
      setNewCallName("");
      // Refresh the selected play
      const playRes = await fetch(`/api/plays/${selectedPlay.id}`);
      if (playRes.ok) setSelectedPlay(await playRes.json());
      await fetchPlays();
    }
  }

  async function handleDeletePlayCall(callId: string) {
    await fetch(`/api/playcalls/${callId}`, { method: "DELETE" });
    if (selectedPlay) {
      const playRes = await fetch(`/api/plays/${selectedPlay.id}`);
      if (playRes.ok) setSelectedPlay(await playRes.json());
    }
    await fetchPlays();
  }

  // --- Detail view for a play concept ---
  if (selectedPlay) {
    return (
      <div>
        <button
          onClick={() => setSelectedPlay(null)}
          className="flex items-center gap-2 text-sm text-white/40 hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to {title}
        </button>

        <div className="backdrop-blur-md bg-white/[0.04] rounded-2xl p-6 border border-white/10 mb-6">
          <h1 className="text-2xl font-bold text-white">{selectedPlay.name}</h1>
          <div className="flex items-center gap-3 mt-2 text-sm text-white/40">
            <span>Formation: <span className="text-white/70">{selectedPlay.formation.name}</span></span>
            <span>·</span>
            <span>Down: <span className="text-white">{selectedPlay.down === "any" ? "Any" : selectedPlay.down}</span></span>
            <span>·</span>
            <span>Distance: <span className="text-white">{distanceLabel(selectedPlay.distance)}</span></span>
          </div>
          <p className="text-xs text-white/40 mt-2">
            {selectedPlay.playCalls.length} play name{selectedPlay.playCalls.length !== 1 ? "s" : ""} added
          </p>
        </div>

        {/* Add play call name */}
        <form onSubmit={handleAddPlayCall} className="flex items-center gap-3 mb-6">
          <input
            type="text"
            value={newCallName}
            onChange={(e) => setNewCallName(e.target.value)}
            placeholder="Type a play name (e.g. Washington, Wizards)..."
            className="flex-1 bg-white/[0.06] border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:ring-2 focus:ring-white/30 focus:outline-none placeholder:text-white/30"
            autoFocus
          />
          <button
            type="submit"
            className="bg-primary-500 text-white px-6 py-3 rounded-lg text-sm font-semibold hover:bg-primary-600 transition-colors flex items-center gap-2"
          >
            <Plus size={16} />
            Add
          </button>
        </form>

        {/* Play calls list */}
        <div className="space-y-2">
          {selectedPlay.playCalls.map((call) => (
            <div
              key={call.id}
              className="flex items-center justify-between backdrop-blur-md bg-white/[0.04] border border-white/10 rounded-2xl px-5 py-4 hover:border-white/25 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-primary-400" />
                <span className="text-sm font-medium text-white">{call.name}</span>
              </div>
              <button
                onClick={() => handleDeletePlayCall(call.id)}
                className="text-white/30 hover:text-red-400 transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          {selectedPlay.playCalls.length === 0 && (
            <div className="backdrop-blur-md bg-white/[0.04] border border-white/10 rounded-2xl p-8 text-center">
              <p className="text-sm text-white/40">
                No play names yet. Type one above and click Add.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- Main list view ---
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {icon}
          <div>
            <h1 className="text-2xl font-bold text-white">{title}</h1>
            <p className="text-sm text-white/40">
              {plays.length} play concept{plays.length !== 1 ? "s" : ""} · {formations.length} formation{formations.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            setPlayForm({
              name: "",
              down: "any",
              distance: "any",
              formationId: activeFormation === "all" ? "" : activeFormation,
            });
            setShowPlayModal(true);
          }}
          disabled={formations.length === 0}
          className="flex items-center gap-2 bg-primary-500 text-white disabled:opacity-40 disabled:cursor-not-allowed px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary-600 transition-colors"
        >
          <Plus size={16} />
          Add Play
        </button>
      </div>

      {/* Filters */}
      <div className="backdrop-blur-md bg-white/[0.04] border border-white/10 rounded-2xl px-4 py-3 mb-6 flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <label className="text-xs text-white/40">Formation</label>
          <div className="flex items-center gap-2">
            <select
              value={activeFormation}
              onChange={(e) => {
                const next = e.target.value;
                if (next === "__add__") {
                  setNewFormationName("");
                  setShowFormationModal(true);
                  return;
                }
                setActiveFormation(next);
              }}
              className="bg-white/[0.06] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-white/30 focus:outline-none min-w-[220px]"
            >
              <option value="all">All Formations</option>
              {formations.map((f) => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
              <option value="__add__">Add formation…</option>
            </select>

            {activeFormation !== "all" && (
              <button
                onClick={() => {
                  const formationName = formations.find((f) => f.id === activeFormation)?.name || "this formation";
                  const ok = window.confirm(`Delete ${formationName}? This will also delete its plays.`);
                  if (!ok) return;
                  handleDeleteFormation(activeFormation);
                }}
                className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-white/10 bg-white/[0.06] text-white/40 hover:text-red-400 hover:border-red-400/30 transition-colors"
                title="Delete selected formation"
                type="button"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Plays Grid */}
      {formations.length === 0 ? (
        <div className="backdrop-blur-md bg-white/[0.04] border border-white/10 rounded-2xl p-12 text-center">
          <p className="text-white/40 text-sm mb-4">
            Add a formation first to start building your playbook.
          </p>
          <button
            onClick={() => setShowFormationModal(true)}
            className="bg-primary-500 text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-primary-600 transition-colors"
          >
            Add Formation
          </button>
        </div>
      ) : plays.length === 0 ? (
        <div className="backdrop-blur-md bg-white/[0.04] border border-white/10 rounded-2xl p-12 text-center">
          <p className="text-white/40 text-sm mb-4">
            No play concepts yet. Add one to get started.
          </p>
          <button
            onClick={() => {
              setPlayForm({
                name: "",
                down: "any",
                distance: "any",
                formationId: activeFormation === "all" ? "" : activeFormation,
              });
              setShowPlayModal(true);
            }}
            className="bg-primary-500 text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-primary-600 transition-colors"
          >
            Add Play
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {plays.map((play) => (
            <div
              key={play.id}
              onClick={() => setSelectedPlay(play)}
              className="group backdrop-blur-md bg-white/[0.04] border border-white/10 rounded-2xl p-5 cursor-pointer hover:border-primary-400/40 hover:shadow-lg hover:shadow-primary-500/10 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-base font-semibold text-white group-hover:text-primary-300 transition-colors">
                  {play.name}
                </h3>
                <div className="flex items-center gap-1">
                  <ChevronRight size={16} className="text-white/20 group-hover:text-primary-400" />
                </div>
              </div>

              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs bg-primary-500/15 text-primary-300 px-2 py-0.5 rounded-full">
                  {play.formation.name}
                </span>
                {play.down !== "any" && (
                  <span className="text-xs bg-white/10 text-white/60 px-2 py-0.5 rounded-full border border-white/10">
                    {play.down}
                  </span>
                )}
                {play.distance !== "any" && (
                  <span className="text-xs bg-white/[0.06] text-white/40 px-2 py-0.5 rounded-full">
                    {distanceLabel(play.distance)}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between">
                <p className="text-xs text-white/40">
                  {play.playCalls.length} play name{play.playCalls.length !== 1 ? "s" : ""}
                </p>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDeletePlay(play.id); }}
                  className="text-white/30 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              {play.playCalls.length > 0 && (
                <div className="mt-3 pt-3 border-t border-white/10 flex flex-wrap gap-1.5">
                  {play.playCalls.slice(0, 5).map((call) => (
                    <span key={call.id} className="text-xs bg-white/[0.06] text-white/70 px-2 py-1 rounded">
                      {call.name}
                    </span>
                  ))}
                  {play.playCalls.length > 5 && (
                    <span className="text-xs text-white/40 px-1 py-1">
                      +{play.playCalls.length - 5} more
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Formation Modal */}
      <Modal open={showFormationModal} onClose={() => setShowFormationModal(false)} title="Add Formation">
        <form onSubmit={handleAddFormation}>
          <label className="block text-xs text-white/40 mb-2">Formation Name</label>
          <input
            type="text"
            value={newFormationName}
            onChange={(e) => setNewFormationName(e.target.value)}
            placeholder="e.g. Ace, Trips, Deuce, I-Form..."
            className="w-full bg-white/[0.06] border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:ring-2 focus:ring-white/30 focus:outline-none mb-5"
            autoFocus
            required
          />
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowFormationModal(false)}
              className="px-5 py-2 text-sm text-white/40 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-primary-500 text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-primary-600 transition-colors"
            >
              Add Formation
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Play Modal */}
      <Modal open={showPlayModal} onClose={() => setShowPlayModal(false)} title="Add Play Concept">
        <form onSubmit={handleAddPlay}>
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-white/40 mb-2">
                Play Concept Name *
              </label>
              <input
                type="text"
                value={playForm.name}
                onChange={(e) => setPlayForm({ ...playForm, name: e.target.value })}
                placeholder="e.g. Outside Zone, Inside Zone, Power, Counter..."
                className="w-full bg-white/[0.06] border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:ring-2 focus:ring-white/30 focus:outline-none"
                autoFocus
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-white/40 mb-2">Down</label>
                <select
                  value={playForm.down}
                  onChange={(e) => setPlayForm({ ...playForm, down: e.target.value })}
                  className="w-full bg-white/[0.06] border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:ring-2 focus:ring-white/30 focus:outline-none"
                >
                  {DOWNS.map((d) => (
                    <option key={d} value={d}>{d === "any" ? "Any Down" : d}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-white/40 mb-2">Distance</label>
                <select
                  value={playForm.distance}
                  onChange={(e) => setPlayForm({ ...playForm, distance: e.target.value })}
                  className="w-full bg-white/[0.06] border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:ring-2 focus:ring-white/30 focus:outline-none"
                >
                  {DISTANCES.map((d) => (
                    <option key={d} value={d}>{distanceLabel(d)}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs text-white/40 mb-2">Formation</label>
              <select
                value={playForm.formationId || ""}
                onChange={(e) => {
                  const next = e.target.value;
                  if (next === "__add__") {
                    setNewFormationName("");
                    setShowFormationModal(true);
                    return;
                  }
                  setPlayForm({ ...playForm, formationId: next });
                }}
                className="w-full bg-white/[0.06] border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:ring-2 focus:ring-white/30 focus:outline-none"
              >
                <option value="" disabled>
                  Select a formation...
                </option>
                {formations.map((f) => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
                <option value="__add__">Add formation…</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={() => setShowPlayModal(false)}
              className="px-5 py-2 text-sm text-white/40 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-primary-500 text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-primary-600 transition-colors"
            >
              Add Play
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
