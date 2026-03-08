"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, ChevronRight } from "lucide-react";
import Link from "next/link";

interface Player {
  id: string;
  name: string;
  number: number;
  position: string;
  height: string;
  weight: string;
  year: string;
}

export default function PlayersPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    number: "",
    position: "LT",
    height: "",
    weight: "",
    year: "",
  });

  useEffect(() => {
    fetchPlayers();
  }, []);

  async function fetchPlayers() {
    const res = await fetch("/api/players");
    if (res.ok) {
      const data = await res.json();
      setPlayers(data);
    }
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

    setForm({ name: "", number: "", position: "LT", height: "", weight: "", year: "" });
    setShowForm(false);
    setEditingId(null);
    fetchPlayers();
  }

  async function handleDelete(id: string) {
    await fetch(`/api/players/${id}`, { method: "DELETE" });
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
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Roster</h1>
          <p className="text-sm text-muted-foreground">
            {players.length} player{players.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setForm({ name: "", number: "", position: "LT", height: "", weight: "", year: "" });
          }}
          className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          Add Player
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-card border border-border rounded-lg p-6 mb-6 grid grid-cols-2 md:grid-cols-3 gap-4"
        >
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full bg-muted border border-border rounded-md px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary-500 focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Number</label>
            <input
              type="number"
              value={form.number}
              onChange={(e) => setForm({ ...form, number: e.target.value })}
              className="w-full bg-muted border border-border rounded-md px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary-500 focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Position</label>
            <select
              value={form.position}
              onChange={(e) => setForm({ ...form, position: e.target.value })}
              className="w-full bg-muted border border-border rounded-md px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary-500 focus:outline-none"
            >
              {["LT", "LG", "C", "RG", "RT"].map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Height</label>
            <input
              type="text"
              value={form.height}
              onChange={(e) => setForm({ ...form, height: e.target.value })}
              className="w-full bg-muted border border-border rounded-md px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary-500 focus:outline-none"
              placeholder="6'3&quot;"
            />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Weight</label>
            <input
              type="text"
              value={form.weight}
              onChange={(e) => setForm({ ...form, weight: e.target.value })}
              className="w-full bg-muted border border-border rounded-md px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary-500 focus:outline-none"
              placeholder="305"
            />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Year</label>
            <input
              type="text"
              value={form.year}
              onChange={(e) => setForm({ ...form, year: e.target.value })}
              className="w-full bg-muted border border-border rounded-md px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary-500 focus:outline-none"
              placeholder="Senior"
            />
          </div>
          <div className="col-span-full flex gap-2">
            <button
              type="submit"
              className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-md text-sm font-medium transition-colors"
            >
              {editingId ? "Update" : "Add"} Player
            </button>
            <button
              type="button"
              onClick={() => { setShowForm(false); setEditingId(null); }}
              className="bg-muted hover:bg-muted/80 text-foreground px-6 py-2 rounded-md text-sm transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">#</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Name</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Pos</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Height</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Weight</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Year</th>
              <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {players.map((player) => (
              <tr
                key={player.id}
                className="border-b border-border/50 hover:bg-muted/30 transition-colors"
              >
                <td className="px-4 py-3 text-sm font-mono text-primary-400">{player.number}</td>
                <td className="px-4 py-3">
                  <Link
                    href={`/dashboard/players/${player.id}`}
                    className="text-sm font-medium text-foreground hover:text-primary-400 transition-colors flex items-center gap-1"
                  >
                    {player.name}
                    <ChevronRight size={14} className="text-muted-foreground" />
                  </Link>
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{player.position}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{player.height}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{player.weight}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{player.year}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => startEdit(player)}
                    className="text-muted-foreground hover:text-primary-400 mr-2 transition-colors"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(player.id)}
                    className="text-muted-foreground hover:text-accent-500 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
            {players.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-sm text-muted-foreground">
                  No players yet. Add your first lineman above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
