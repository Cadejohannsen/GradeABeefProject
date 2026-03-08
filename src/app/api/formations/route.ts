import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCoachId } from "@/lib/dev-auth";

function toTitleCase(value: string) {
  return value
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

export async function GET(req: Request) {
  const coachId = await getCoachId();
  const { searchParams } = new URL(req.url);
  const _category = searchParams.get("category");

  const formations = await prisma.formation.findMany({
    where: {
      coachId,
    },
    include: { plays: { orderBy: { createdAt: "asc" } } },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(formations);
}

export async function POST(req: Request) {
  const coachId = await getCoachId();
  const { name, category } = await req.json();

  if (!name) {
    return NextResponse.json({ error: "Name required" }, { status: 400 });
  }

  const formattedName = toTitleCase(String(name));
  if (!formattedName) {
    return NextResponse.json({ error: "Name required" }, { status: 400 });
  }

  const normalizedCategory = typeof category === "string" && category.trim() ? category.trim() : "all";

  const formation = await prisma.formation.create({
    data: { coachId, name: formattedName, category: normalizedCategory },
  });

  return NextResponse.json(formation);
}
