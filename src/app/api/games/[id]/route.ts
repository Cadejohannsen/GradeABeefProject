import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const game = await prisma.game.findUnique({
    where: { id: params.id },
    include: {
      snaps: {
        orderBy: { snapNumber: "asc" },
        include: {
          grades: {
            include: { player: true },
          },
        },
      },
      playerStats: {
        include: { player: true },
      },
    },
  });

  if (!game) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(game);
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  await prisma.game.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
