import { NextResponse } from "next/server";
import { findMany, create, type Formation, type CreateFormation } from "@/lib/json-db";
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

  const formations = findMany<Formation>("formations", { coachId })
    .sort((a, b) => a.name.localeCompare(b.name));

  // TODO: Add plays relation when we implement plays API
  const formationsWithPlays = formations.map(f => ({ ...f, plays: [] }));

  return NextResponse.json(formationsWithPlays);
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

  const formation = create<CreateFormation>("formations", {
    coachId,
    name: formattedName,
    category: normalizedCategory,
  }) as Formation;

  return NextResponse.json(formation);
}
