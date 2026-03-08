import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCoachId } from "@/lib/dev-auth";

export async function GET() {
  const coachId = await getCoachId();

  // Auto-create a default season if none exists
  let season = await prisma.season.findFirst({ where: { coachId } });
  if (!season) {
    season = await prisma.season.create({
      data: { name: "2025 Season", coachId },
    });
  }

  const games = await prisma.game.findMany({
    where: { season: { coachId } },
    orderBy: { weekNumber: "asc" },
  });

  return NextResponse.json(games);
}

export async function POST(req: Request) {
  const coachId = await getCoachId();
  const data = await req.json();

  // Auto-create a default season if none exists
  let season = await prisma.season.findFirst({ where: { coachId } });
  if (!season) {
    season = await prisma.season.create({
      data: { name: "2025 Season", coachId },
    });
  }

  const game = await prisma.game.create({
    data: {
      seasonId: season.id,
      opponent: data.opponent,
      date: new Date(data.date),
      weekNumber: data.weekNumber || 1,
    },
  });

  return NextResponse.json(game);
}
