import { NextResponse } from "next/server";
import { findMany, create, type Player, type CreatePlayer } from "@/lib/json-db";
import { getCoachId } from "@/lib/dev-auth";

export async function GET() {
  const coachId = await getCoachId();
  const players = findMany<Player>("players", { coachId });
  const sorted = players.sort((a, b) => a.number - b.number);
  return NextResponse.json(sorted);
}

export async function POST(req: Request) {
  const coachId = await getCoachId();
  const data = await req.json();

  const player = create<CreatePlayer>("players", {
    coachId,
    name: data.name,
    number: data.number,
    position: data.position,
    height: data.height || "",
    weight: data.weight || "",
    year: data.year || "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  return NextResponse.json(player);
}
