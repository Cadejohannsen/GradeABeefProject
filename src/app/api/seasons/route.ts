import { NextResponse } from "next/server";
import { findFirst, create, cuid, now, type Season, type CreateSeason } from "@/lib/json-db";
import { getCoachId } from "@/lib/dev-auth";

export async function POST(request: Request) {
  const coachId = await getCoachId();
  const { year } = await request.json();

  if (!year || typeof year !== "string") {
    return NextResponse.json({ error: "Year is required" }, { status: 400 });
  }

  // Return existing season if it already exists
  let season = findFirst<Season>("seasons", { coachId, name: year });

  if (!season) {
    season = create<CreateSeason>("seasons", {
      id: cuid(),
      name: year,
      coachId,
      createdAt: now(),
    }) as Season;
  }

  return NextResponse.json({ season });
}
