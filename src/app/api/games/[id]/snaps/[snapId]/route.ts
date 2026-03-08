import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: Request,
  { params }: { params: { id: string; snapId: string } }
) {
  const data = await req.json();

  // Update snap info
  await prisma.gameSnap.update({
    where: { id: params.snapId },
    data: {
      playName: data.playName,
      playType: data.playType ?? undefined,
      comment: data.comment ?? undefined,
    },
  });

  // Upsert grades
  if (data.grades && Array.isArray(data.grades)) {
    for (const g of data.grades) {
      if (!g.playerId) continue;

      const existing = await prisma.snapGrade.findFirst({
        where: { snapId: params.snapId, playerId: g.playerId },
      });

      if (g.value === null || g.value === undefined || g.value === 0) {
        // Delete grade if cleared
        if (existing) {
          await prisma.snapGrade.delete({ where: { id: existing.id } });
        }
      } else if (existing) {
        await prisma.snapGrade.update({
          where: { id: existing.id },
          data: { value: g.value },
        });
      } else {
        await prisma.snapGrade.create({
          data: {
            snapId: params.snapId,
            playerId: g.playerId,
            value: g.value,
          },
        });
      }
    }
  }

  const updated = await prisma.gameSnap.findUnique({
    where: { id: params.snapId },
    include: { grades: { include: { player: true } } },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string; snapId: string } }
) {
  await prisma.gameSnap.delete({ where: { id: params.snapId } });
  return NextResponse.json({ ok: true });
}
