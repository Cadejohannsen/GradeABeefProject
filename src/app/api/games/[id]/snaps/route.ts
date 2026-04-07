import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const data = await req.json();
  const gameId = params.id;

  // Get the next snap number
  const lastSnap = await prisma.gameSnap.findFirst({
    where: { gameId },
    orderBy: { snapNumber: "desc" },
  });
  const snapNumber = (lastSnap?.snapNumber || 0) + 1;

  const snap = await prisma.gameSnap.create({
    data: {
      gameId,
      snapNumber,
      playName: data.playName || "",
      playType: data.playType || "run",
      scheme: data.scheme || "",
      te: data.te || 0,
      xtkl: data.xtkl || 0,
      xtkl2: data.xtkl2 || 0,
      comment: data.comment || "",
    },
    include: { grades: { include: { player: true } } },
  });

  // If grades were provided, create them
  if (data.grades && Array.isArray(data.grades)) {
    for (const g of data.grades) {
      if (g.playerId && g.value) {
        await prisma.snapGrade.create({
          data: {
            snapId: snap.id,
            playerId: g.playerId,
            value: g.value,
          },
        });
      }
    }
    // Re-fetch with grades
    const updated = await prisma.gameSnap.findUnique({
      where: { id: snap.id },
      include: { grades: { include: { player: true } } },
    });
    return NextResponse.json(updated);
  }

  return NextResponse.json(snap);
}
