"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, ChevronRight, X, Users } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface Player {
  id: string;
  name: string;
  number: number;
  position: string;
  height: string;
  weight: string;
  year: string;
}

const POSITIONS = ["LT", "LG", "C", "RG", "RT"];

const emptyForm = { name: "", number: "", position: "LT", height: "", weight: "", year: "" };

export default function PlayersPage() {
  const searchParams = useSearchParams();
  const yearParam = searchParams.get("year");

  const [players, setPlayers] = useState<Player[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    fetchPlayers();
  }, []);

  async function fetchPlayers() {
    const res = await fetch("/api/players");
    if (res.ok) setPlayers(await res.json());
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const method = editingId ? "PUT" : "POST";
    const url = editingId ? `/api/players/${editingId}` : "/api/players";
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, number: parseInt(form.number) }),
    });
    setForm(emptyForm);
    setShowForm(false);
    setEditingId(null);
    fetchPlayers();
  }

  async function handleDelete(id: string) {
    await fetch(`/api/players/${id}`, { method: "DELETE" });
    setDeleteConfirm(null);
    fetchPlayers();
  }

  function startEdit(player: Player) {
    setForm({
      name: player.name,
      number: String(player.number),
      position: player.position,
      height: player.height,
      weight: player.weight,
      year: player.year,
    });
    setEditingId(player.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function openAdd() {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  }

  return (
    <div className="max-w-4xl animate-fade-in">

      {/* Page header */}
      <div className="flex items-start justify-between mb-7">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary-500/10 border border-primary-500/15 flex items-center justify-center flex-shrink-0">
            <Users size={17} className="text-primary-300" />
          </div>
          <div>
            <h1 className="text-white">Roster</h1>
            <p className="text-[13px] text-white/35 mt-0.5 font-inter">
              {players.length} {players.length === 1 ? "player" : "players"} on the roster
            </p>
          </div>
        </div>
        {!showForm && (
          <button onClick={openAdd} className="btn-primary mt-1">
            <Plus size={15} />
            Add Player
          </button>
        )}
      </div>

      {/* Add / Edit form */}
      {showForm && (
        <div className="card mb-6 p-6 animate-slide-up">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-white text-base">{editingId ? "Edit Player" : "Add New Player"}</h2>
              <p className="text-[12px] text-white/30 mt-0.5 font-inter">
                {editingId ? "Update the player's information" : "Fill in the details for your new lineman"}
              </p>
            </div>
            <button
              onClick={() => { setShowForm(false); setEditingId(null); }}
              className="w-8 h-8 rounded-lg bg-white/[0.05] hover:bg-white/[0.09] flex items-center justify-center text-white/40 hover:text-white transition-all"
            >
              <X size={15} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="col-span-2 md:col-span-1">
              <label className="block text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-1.5 font-inter">
                Full Name
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input-field"
                placeholder="John Smith"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-1.5 font-inter">
                Jersey #
              </label>
              <input
                type="number"
                value={form.number}
                onChange={(e) => setForm({ ...form, number: e.target.value })}
                className="input-field font-mono"
                placeholder="72"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-1.5 font-inter">
                Position
              </label>
              <select
                value={form.position}
                onChange={(e) => setForm({ ...form, position: e.target.value })}
                className="select-field"
              >
                {POSITIONS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-1.5 font-inter">
                Height
              </label>
              <input
                type="text"
                value={form.height}
                onChange={(e) => setForm({ ...form, height: e.target.value })}
                className="input-field"
                placeholder={`6'3"`}
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-1.5 font-inter">
                Weight
              </label>
              <input
                type="text"
                value={form.weight}
                onChange={(e) => setForm({ ...form, weight: e.target.value })}
                className="input-field font-mono"
                placeholder="305 lbs"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-1.5 font-inter">
                Year
              </label>
              <input
                type="text"
                value={form.year}
                onChange={(e) => setForm({ ...form, year: e.target.value })}
                className="input-field"
                placeholder="Senior"
              />
            </div>

            <div className="col-span-full pt-2 flex items-center gap-3 border-t border-white/[0.06] mt-1">
              <button type="submit" className="btn-primary">
                {editingId ? "Save Changes" : "Add Player"}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setEditingId(null); }}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Players table */}
      <div className="card overflow-hidden">
        {players.length > 0 ? (
          <table className="w-full font-inter">
            <thead>
              <tr className="border-b border-white/[0.07] bg-white/[0.02]">
                <th className="text-left px-5 py-3.5 text-white/30">#</th>
                <th className="text-left px-4 py-3.5 text-white/30">Name</th>
                <th className="text-left px-4 py-3.5 text-white/30">Position</th>
                <th className="text-left px-4 py-3.5 text-white/30">Height</th>
                <th className="text-left px-4 py-3.5 text-white/30">Weight</th>
                <th className="text-left px-4 py-3.5 text-white/30">Year</th>
                <th className="text-right px-5 py-3.5 text-white/30">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {players.map((player) => (
                <tr
                  key={player.id}
                  className="hover:bg-white/[0.02] transition-colors duration-100 group"
                >
                  <td className="px-5 py-3.5 font-mono text-white/45 text-[13px]">{player.number}</td>
                  <td className="px-4 py-3.5">
                    <Link
                      href={`/dashboard/players/${player.id}${yearParam ? `?year=${yearParam}` : ""}`}
                      className="flex items-center gap-1.5 text-[13px] font-semibold text-white hover:text-primary-200 transition-colors group/link"
                    >
                      {player.name}
                      <ChevronRight
                        size={13}
                        className="text-white/20 group-hover/link:text-primary-300 transition-colors opacity-0 group-hover:opacity-100"
                      />
                    </Link>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="text-[11px] font-bold text-white/50 bg-white/[0.06] px-2 py-1 rounded-md font-mono">
                      {player.position}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-[13px] text-white/45 font-mono">{player.height || "—"}</td>
                  <td className="px-4 py-3.5 text-[13px] text-white/45 font-mono">{player.weight || "—"}</td>
                  <td className="px-4 py-3.5 text-[13px] text-white/45">{player.year || "—"}</td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => startEdit(player)}
                        className="w-7 h-7 rounded-md hover:bg-white/[0.08] flex items-center justify-center text-white/35 hover:text-white/70 transition-all"
                        title="Edit player"
                      >
                        <Edit2 size={13} />
                      </button>
                      {deleteConfirm === player.id ? (
                        <div className="flex items-center gap-1 ml-1">
                          <button
                            onClick={() => handleDelete(player.id)}
                            className="text-[11px] text-red-400 hover:text-red-300 font-medium font-inter px-2 py-1 rounded hover:bg-red-500/10 transition-all"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="text-[11px] text-white/30 hover:text-white/60 font-inter px-2 py-1 rounded hover:bg-white/[0.05] transition-all"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirm(player.id)}
                          className="w-7 h-7 rounded-md hover:bg-red-500/10 flex items-center justify-center text-white/30 hover:text-red-400 transition-all"
                          title="Delete player"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="py-20 text-center">
            <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-4">
              <Users size={24} className="text-white/15" />
            </div>
            <p className="text-[14px] font-medium text-white/30 font-inter">No players on the roster</p>
            <p className="text-[12px] text-white/20 font-inter mt-1">Add your first lineman to get started</p>
            <button onClick={openAdd} className="btn-primary mx-auto mt-5">
              <Plus size={15} />
              Add First Player
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
