import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCoachId } from "@/lib/dev-auth";

export async function POST(request: Request) {
  const coachId = await getCoachId();
  const { year } = await request.json();

  if (!year || typeof year !== "string") {
    return NextResponse.json({ error: "Year is required" }, { status: 400 });
  }

  // Check if season already exists
  let season = await prisma.season.findFirst({
    where: {
      coachId,
      name: year,
    },
  });

  // Create season if it doesn't exist
  if (!season) {
    season = await prisma.season.create({
      data: {
        name: year,
        coachId,
      },
    });
  }

  return NextResponse.json({ season });
}
