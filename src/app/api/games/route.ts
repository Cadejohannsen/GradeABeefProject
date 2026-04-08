import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCoachId } from "@/lib/dev-auth";

export async function GET(request: Request) {
  const coachId = await getCoachId();
  const { searchParams } = new URL(request.url);
  const year = searchParams.get("year");

  // Require year parameter
  if (!year) {
    return NextResponse.json({ error: "Year parameter is required" }, { status: 400 });
  }

  // Find the season for the given year
  const season = await prisma.season.findFirst({
    where: { 
      coachId,
      name: year 
    },
  });

  // If no season exists for this year, return empty array
  if (!season) {
    return NextResponse.json([]);
  }

  const games = await prisma.game.findMany({
    where: { seasonId: season.id },
    orderBy: { weekNumber: "asc" },
  });

  return NextResponse.json(games);
}

export async function POST(req: Request) {
  const coachId = await getCoachId();
  const data = await req.json();
  const year = data.year || new Date().getFullYear().toString();

  // Find the season for the given year, or create it if it doesn't exist
  let season = await prisma.season.findFirst({
    where: { 
      coachId,
      name: year 
    },
  });

  if (!season) {
    season = await prisma.season.create({
      data: { name: year, coachId },
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
