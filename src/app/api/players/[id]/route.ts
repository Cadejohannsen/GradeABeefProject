import { NextResponse } from "next/server";
import { update, remove, type Player } from "@/lib/json-db";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const data = await req.json();

  const player = update<Player>("players", params.id, {
    name: data.name,
    number: data.number,
    position: data.position,
    height: data.height || "",
    weight: data.weight || "",
    year: data.year || "",
  });

  return NextResponse.json(player);
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const success = remove("players", params.id);
  return NextResponse.json({ ok: success });
}
