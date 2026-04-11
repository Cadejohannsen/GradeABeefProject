import { NextResponse } from "next/server";
import {
  findUnique,
  findMany,
  findFirst,
  update,
  remove,
  create,
  cuid,
  removeWhere,
  type GameSnap,
  type SnapGrade,
  type Player,
} from "@/lib/json-db";

export async function PUT(
  req: Request,
  { params }: { params: { id: string; snapId: string } }
) {
  const data = await req.json();

  // Update snap info
  update<GameSnap>("gameSnaps", params.snapId, {
    playName: data.playName,
    ...(data.playType !== undefined && { playType: data.playType }),
    ...(data.scheme !== undefined && { scheme: data.scheme }),
    ...(data.te !== undefined && { te: data.te }),
    ...(data.xtkl !== undefined && { xtkl: data.xtkl }),
    ...(data.xtkl2 !== undefined && { xtkl2: data.xtkl2 }),
    ...(data.comment !== undefined && { comment: data.comment }),
  });

  // Upsert grades
  if (data.grades && Array.isArray(data.grades)) {
    for (const g of data.grades) {
      if (!g.playerId) continue;

      const existing = findFirst<SnapGrade>("snapGrades", {
        snapId: params.snapId,
        playerId: g.playerId,
      });

      if (g.value === null || g.value === undefined || g.value === 0) {
        if (existing) remove("snapGrades", existing.id);
      } else if (existing) {
        update<SnapGrade>("snapGrades", existing.id, { value: g.value });
      } else {
        create<SnapGrade>("snapGrades", {
          id: cuid(),
          snapId: params.snapId,
          playerId: g.playerId,
          value: g.value,
        });
      }
    }
  }

  const snap = findUnique<GameSnap>("gameSnaps", params.snapId);
  const grades = findMany<SnapGrade>("snapGrades", { snapId: params.snapId });
  const players = findMany<Player>("players");

  return NextResponse.json({
    ...snap,
    grades: grades.map((g) => ({
      ...g,
      player: players.find((p) => p.id === g.playerId),
    })),
  });
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string; snapId: string } }
) {
  removeWhere<SnapGrade>("snapGrades", "snapId", params.snapId);
  remove("gameSnaps", params.snapId);
  return NextResponse.json({ ok: true });
}
