import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";
import { findUnique, findUniqueByEmail, create, now, type Coach, type CreateCoach } from "@/lib/json-db";

export async function POST(req: Request) {
  try {
    const { name, email, teamName, idToken } = await req.json();

    if (!name || !email || !idToken) {
      return NextResponse.json(
        { error: "Name, email, and ID token are required" },
        { status: 400 }
      );
    }

    let decoded;
    try {
      decoded = await adminAuth.verifyIdToken(idToken);
    } catch {
      return NextResponse.json({ error: "Invalid authentication token" }, { status: 401 });
    }

    if (decoded.email !== email) {
      return NextResponse.json({ error: "Token email mismatch" }, { status: 401 });
    }

    // Return existing coach if already registered
    const existing =
      findUnique<Coach>("coaches", decoded.uid) ??
      findUniqueByEmail<Coach>("coaches", email);

    if (existing) {
      return NextResponse.json({ id: existing.id, name: existing.name, email: existing.email });
    }

    const coach = create<CreateCoach>("coaches", {
      id: decoded.uid,
      name,
      email,
      passwordHash: "",
      teamName: teamName || "",
      createdAt: now(),
      updatedAt: now(),
    });

    return NextResponse.json({ id: coach.id, name: coach.name, email: coach.email });
  } catch {
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
