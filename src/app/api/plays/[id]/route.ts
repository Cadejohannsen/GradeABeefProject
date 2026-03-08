import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const play = await prisma.play.findUnique({
    where: { id: params.id },
    include: {
      formation: true,
      playCalls: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!play) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(play);
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const data = await req.json();

  const play = await prisma.play.update({
    where: { id: params.id },
    data: {
      name: data.name,
      down: data.down || "any",
      distance: data.distance || "any",
      ...(data.formationId ? { formationId: data.formationId } : {}),
    },
    include: { formation: true, playCalls: true },
  });

  return NextResponse.json(play);
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  await prisma.play.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
