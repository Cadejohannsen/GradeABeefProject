import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const data = await req.json();
  const gameId = params.id;

  if (!data.playerId) {
    return NextResponse.json({ error: "playerId required" }, { status: 400 });
  }

  const stats = await prisma.gamePlayerStats.upsert({
    where: {
      gameId_playerId: { gameId, playerId: data.playerId },
    },
    create: {
      gameId,
      playerId: data.playerId,
      sacks: data.sacks ?? 0,
      missedAssignments: data.missedAssignments ?? 0,
      penalties: data.penalties ?? 0,
      pressures: data.pressures ?? 0,
      badSnaps: data.badSnaps ?? 0,
      knockdowns: data.knockdowns ?? 0,
      da: data.da ?? 0,
    },
    update: {
      sacks: data.sacks ?? undefined,
      missedAssignments: data.missedAssignments ?? undefined,
      penalties: data.penalties ?? undefined,
      pressures: data.pressures ?? undefined,
      badSnaps: data.badSnaps ?? undefined,
      knockdowns: data.knockdowns ?? undefined,
      da: data.da ?? undefined,
    },
  });

  return NextResponse.json(stats);
}
