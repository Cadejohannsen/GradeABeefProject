import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCoachId } from "@/lib/dev-auth";
import { calcGradeStats, teamAvg, topPerformer } from "@/lib/grading";

export async function GET() {
  const coachId = await getCoachId();

  // Players
  const players = await prisma.player.findMany({
    where: { coachId },
    orderBy: { number: "asc" },
    select: { id: true, name: true, number: true, position: true, height: true, weight: true, year: true },
  });

  // Games (with snap count)
  const games = await prisma.game.findMany({
    where: { season: { coachId } },
    orderBy: { weekNumber: "asc" },
    select: { id: true, opponent: true, weekNumber: true, date: true, _count: { select: { snaps: true } } },
  });

  // All snap grades for this coach's players
  const allGrades = await prisma.snapGrade.findMany({
    where: { player: { coachId } },
    select: { playerId: true, value: true },
  });

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
    games: games.map((g) => ({ ...g, snapCount: g._count.snaps })),
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
