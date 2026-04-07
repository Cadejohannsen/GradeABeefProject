import { NextResponse } from "next/server";
import { findFirst, create, findMany, type Season, type Game, type CreateSeason, type CreateGame } from "@/lib/json-db";
import { getCoachId } from "@/lib/dev-auth";

export async function GET() {
  const coachId = await getCoachId();

  // Auto-create a default season if none exists
  let season = findFirst<Season>("seasons", { coachId });
  if (!season) {
    season = create<CreateSeason>("seasons", {
      name: "2025 Season",
      coachId,
      createdAt: new Date().toISOString(),
    }) as Season;
  }

  const games = findMany<Game>("games", { seasonId: season.id! })
    .sort((a, b) => a.weekNumber - b.weekNumber);

  return NextResponse.json(games);
}

export async function POST(req: Request) {
  const coachId = await getCoachId();
  const data = await req.json();

  // Auto-create a default season if none exists
  let season = findFirst<Season>("seasons", { coachId });
  if (!season) {
    season = create<CreateSeason>("seasons", {
      name: "2025 Season",
      coachId,
      createdAt: new Date().toISOString(),
    }) as Season;
  }

  const game = create<CreateGame>("games", {
    seasonId: season.id!,
    opponent: data.opponent,
    date: new Date(data.date).toISOString(),
    weekNumber: data.weekNumber || 1,
    createdAt: new Date().toISOString(),
  });

  return NextResponse.json(game);
}
