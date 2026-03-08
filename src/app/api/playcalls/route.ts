import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { name, playId } = await req.json();

  if (!name || !playId) {
    return NextResponse.json({ error: "Name and playId required" }, { status: 400 });
  }

  const playCall = await prisma.playCall.create({
    data: { name, playId },
  });

  return NextResponse.json(playCall);
}
