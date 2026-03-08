import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const data = await req.json();

  const player = await prisma.player.update({
    where: { id: params.id },
    data: {
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

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  await prisma.player.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
