import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCoachId } from "@/lib/dev-auth";
import { calcGradeStats, teamAvg, topPerformer } from "@/lib/grading";

export async function GET() {
  const coachId = await getCoachId();

  // Players
  const players = await prisma.player.findMany({
    where: { coachId },
    orderBy: { name: "asc" },
    select: { id: true, name: true, number: true, position: true },
  });

  // Games
  const games = await prisma.game.findMany({
    where: { season: { coachId } },
    orderBy: { weekNumber: "desc" },
    select: { id: true, opponent: true, weekNumber: true, date: true },
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

  return NextResponse.json({
    playerCount: players.length,
    players: players.slice(0, 5),
    gameCount: games.length,
    recentGame: games[0] ?? null,
    teamJobAvg,
    teamTechAvg,
    teamFinalAvg,
    topJob,
    topTech,
  });
}
