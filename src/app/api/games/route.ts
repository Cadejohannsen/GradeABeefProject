import { NextResponse } from "next/server";
import { findFirst, create, findMany, type Season, type Game, type CreateSeason, type CreateGame } from "@/lib/json-db";
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
  const season = findFirst<Season>("seasons", { coachId, name: year });

  // If no season exists for this year, return empty array
  if (!season) {
    return NextResponse.json([]);
  }

  const games = findMany<Game>("games").filter(g => g.seasonId === season.id)
    .sort((a, b) => a.weekNumber - b.weekNumber);

  return NextResponse.json(games);
}

export async function POST(req: Request) {
  const coachId = await getCoachId();
  const data = await req.json();
  const year = data.year || new Date().getFullYear().toString();

  // Find the season for the given year, or create it if it doesn't exist
  let season = findFirst<Season>("seasons", { coachId, name: year });
  if (!season) {
    season = create<CreateSeason>("seasons", {
      name: year,
      coachId,
      createdAt: new Date().toISOString(),
    }) as Season;
  }

  const game = create<CreateGame>("games", {
    seasonId: season.id,
    opponent: data.opponent,
    date: new Date(data.date).toISOString(),
    weekNumber: data.weekNumber || 1,
    createdAt: new Date().toISOString(),
  });

  return NextResponse.json(game);
}
