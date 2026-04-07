import { NextResponse } from "next/server";
import { findUnique, findMany, update, remove, type Game, type GameSnap, type SnapGrade, type Player, type GamePlayerStats } from "@/lib/json-db";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const game = findUnique<Game>("games", params.id);
  if (!game) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Get all related data
  const snaps = findMany<GameSnap>("gameSnaps", { gameId: game.id })
    .sort((a, b) => a.snapNumber - b.snapNumber);
  
  const snapIds = snaps.map(s => s.id);
  const grades = findMany<SnapGrade>("snapGrades").filter(g => snapIds.includes(g.snapId));
  const playerIds = grades.map(g => g.playerId);
  const players = findMany<Player>("players").filter(p => playerIds.includes(p.id));
  
  const stats = findMany<GamePlayerStats>("gamePlayerStats", { gameId: game.id });
  const statsPlayerIds = stats.map(s => s.playerId);
  const statsPlayers = findMany<Player>("players").filter(p => statsPlayerIds.includes(p.id));

  // Build the nested structure
  const snapsWithGrades = snaps.map(snap => ({
    ...snap,
    grades: grades
      .filter(g => g.snapId === snap.id)
      .map(g => ({
        ...g,
        player: players.find(p => p.id === g.playerId)
      }))
  }));

  const gameWithStats = {
    ...game,
    snaps: snapsWithGrades,
    playerStats: stats.map(stat => ({
      ...stat,
      player: statsPlayers.find(p => p.id === stat.playerId)
    }))
  };

  return NextResponse.json(gameWithStats);
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const data = await req.json();
  const game = update<Game>("games", params.id, {
    opponent: data.opponent,
    date: new Date(data.date).toISOString(),
    weekNumber: data.weekNumber,
  });

  return NextResponse.json(game);
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const success = remove("games", params.id);
  return NextResponse.json({ ok: success });
}
