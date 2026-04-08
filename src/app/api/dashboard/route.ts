import { NextResponse } from "next/server";
import { findMany, type Player, type Game, type Season, type SnapGrade, type GameSnap } from "@/lib/json-db";
import { getCoachId } from "@/lib/dev-auth";
import { calcGradeStats, teamAvg, topPerformer } from "@/lib/grading";

export async function GET(request: Request) {
  const coachId = await getCoachId();
  const { searchParams } = new URL(request.url);
  const year = searchParams.get("year");

  // Require year parameter
  if (!year) {
    return NextResponse.json({ error: "Year parameter is required" }, { status: 400 });
  }

  // Players
  const players = findMany<Player>("players", { coachId }).sort((a, b) => a.number - b.number);

  // Games (with snap count) - filtered by season
  const seasons = findMany<Season>("seasons", { coachId, name: year });
  const games = findMany<Game>("games").filter(g => seasons.some(s => s.id === g.seasonId))
    .sort((a, b) => a.weekNumber - b.weekNumber);

  // Get all game snaps for these games
  const gameIds = games.map(g => g.id);
  const allSnaps = findMany<GameSnap>("gameSnaps").filter(s => gameIds.includes(s.gameId));

  // All snap grades for this coach's players
  const playerIds = players.map(p => p.id);
  const snapIds = allSnaps.map(s => s.id);
  const allGrades = findMany<SnapGrade>("snapGrades").filter(g => 
    playerIds.includes(g.playerId) && snapIds.includes(g.snapId)
  );

  // Per-player grade stats using shared grading algorithm
  const playerStats = players.map((p) => {
    const grades = allGrades.filter((g) => g.playerId === p.id);
    const stats = calcGradeStats(grades);
    return { ...p, snaps: stats.snaps, jobPct: stats.jobPct, techPct: stats.techPct, finalPct: stats.finalPct };
  });

  // Team averages & top performers via shared helpers
  const teamJobAvg   = teamAvg(playerStats, "jobPct");
  const teamTechAvg  = teamAvg(playerStats, "techPct");
  const teamFinalAvg = teamAvg(playerStats, "finalPct");
  const topJob  = topPerformer(playerStats, "jobPct");
  const topTech = topPerformer(playerStats, "techPct");

  // Sorted leaderboards
  const byJob = [...playerStats].filter((p) => p.snaps > 0).sort((a, b) => b.jobPct - a.jobPct);
  const byTech = [...playerStats].filter((p) => p.snaps > 0).sort((a, b) => b.techPct - a.techPct);
  const byFinal = [...playerStats].filter((p) => p.snaps > 0).sort((a, b) => b.finalPct - a.finalPct);

  return NextResponse.json({
    playerCount: players.length,
    playerStats,
    games: games.map((g) => ({ ...g, snapCount: allSnaps.filter(s => s.gameId === g.id).length })),
    gameCount: games.length,
    recentGame: games[games.length - 1] ?? null,
    teamJobAvg,
    teamTechAvg,
    teamFinalAvg,
    topJob,
    topTech,
    byJob,
    byTech,
    byFinal,
  });
}
