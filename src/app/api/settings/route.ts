import { NextResponse } from "next/server";
import { findFirst, update, type Coach } from "@/lib/json-db";
import { getCoachId } from "@/lib/dev-auth";

export async function GET() {
  const coachId = await getCoachId();
  const coach = findFirst<Coach>("coaches", { id: coachId });
  if (!coach) return NextResponse.json({ error: "Coach not found" }, { status: 404 });

  return NextResponse.json({
    teamName: coach.teamName ?? "",
    primaryColor: coach.primaryColor ?? "#2D1B4E",
    logoDataUrl: coach.logoDataUrl ?? null,
  });
}

export async function PUT(req: Request) {
  const coachId = await getCoachId();
  const { teamName, primaryColor, logoDataUrl } = await req.json();

  const updated = update<Coach>("coaches", coachId, {
    teamName,
    primaryColor,
    logoDataUrl,
    updatedAt: new Date().toISOString(),
  });

  if (!updated) return NextResponse.json({ error: "Coach not found" }, { status: 404 });

  return NextResponse.json({ success: true });
}
