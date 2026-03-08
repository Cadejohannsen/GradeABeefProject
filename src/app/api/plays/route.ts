import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function toTitleCase(value: string) {
  return value
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const formationId = searchParams.get("formationId");

  const plays = await prisma.play.findMany({
    where: {
      ...(category ? { category } : {}),
      ...(formationId ? { formationId } : {}),
    },
    include: {
      formation: true,
      playCalls: { orderBy: { createdAt: "asc" } },
    },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(plays);
}

export async function POST(req: Request) {
  const data = await req.json();

  if (!data.name || !data.formationId || !data.category) {
    return NextResponse.json(
      { error: "Name, formation, and category are required" },
      { status: 400 }
    );
  }

  const formattedName = toTitleCase(String(data.name));
  if (!formattedName) {
    return NextResponse.json(
      { error: "Name, formation, and category are required" },
      { status: 400 }
    );
  }

  const play = await prisma.play.create({
    data: {
      formationId: data.formationId,
      name: formattedName,
      category: data.category,
      down: data.down || "any",
      distance: data.distance || "any",
    },
    include: { formation: true, playCalls: true },
  });

  return NextResponse.json(play);
}
