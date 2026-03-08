import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCoachId } from "@/lib/dev-auth";

export async function GET() {
  const coachId = await getCoachId();
  const players = await prisma.player.findMany({
    where: { coachId },
    orderBy: { number: "asc" },
  });

  return NextResponse.json(players);
}

export async function POST(req: Request) {
  const coachId = await getCoachId();
  const data = await req.json();

  const player = await prisma.player.create({
    data: {
      coachId,
      name: data.name,
      number: data.number,
      position: data.position,
      height: data.height || "",
      weight: data.weight || "",
      year: data.year || "",
    },
  });

  return NextResponse.json(player);
}
