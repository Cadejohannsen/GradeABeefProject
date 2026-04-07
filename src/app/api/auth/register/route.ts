import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { findFirst, create, cuid, now, type Coach, type CreateCoach } from "@/lib/json-db";

export async function POST(req: Request) {
  try {
    const { name, email, password, teamName } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    const existing = findFirst<Coach>("coaches", { email });
    if (existing) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const coach = create<CreateCoach>("coaches", {
      id: cuid(),
      name,
      email,
      passwordHash,
      teamName: teamName || "",
      createdAt: now(),
      updatedAt: now(),
    });

    return NextResponse.json({ id: coach.id, name: coach.name, email: coach.email });
  } catch (error) {
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
