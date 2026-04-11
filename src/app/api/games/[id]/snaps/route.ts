import { NextResponse } from "next/server";
import {
  findMany,
  create,
  cuid,
  now,
  type GameSnap,
  type SnapGrade,
  type Player,
} from "@/lib/json-db";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const data = await req.json();
  const gameId = params.id;

  // Get next snap number
  const existing = findMany<GameSnap>("gameSnaps", { gameId })
    .sort((a, b) => b.snapNumber - a.snapNumber);
  const snapNumber = (existing[0]?.snapNumber || 0) + 1;

  const snap = create<GameSnap>("gameSnaps", {
    id: cuid(),
    gameId,
    snapNumber,
    playName: data.playName || "",
    playType: data.playType || "run",
    scheme: data.scheme || "",
    te: data.te || 0,
    xtkl: data.xtkl || 0,
    xtkl2: data.xtkl2 || 0,
    comment: data.comment || "",
    createdAt: now(),
  });

  // Create grades if provided
  if (data.grades && Array.isArray(data.grades)) {
    for (const g of data.grades) {
      if (g.playerId && g.value) {
        create<SnapGrade>("snapGrades", {
          id: cuid(),
          snapId: snap.id,
          playerId: g.playerId,
          value: g.value,
        });
      }
    }
  }

  // Return snap with grades
  const grades = findMany<SnapGrade>("snapGrades", { snapId: snap.id });
  const players = findMany<Player>("players");
  return NextResponse.json({
    ...snap,
    grades: grades.map((g) => ({
      ...g,
      player: players.find((p) => p.id === g.playerId),
    })),
  });
}
