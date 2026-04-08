import { findFirst, create, cuid, now, type Coach, type CreateCoach } from "@/lib/json-db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const DEV_COACH_EMAIL = "dev@gradeabeef.local";

export async function getCoachId(): Promise<string> {
  // Dev mode: find or create a default coach
  let coach = findFirst<Coach>("coaches", { email: DEV_COACH_EMAIL });
  if (!coach) {
    coach = create<CreateCoach>("coaches", {
      id: cuid(),
      name: "Coach",
      email: DEV_COACH_EMAIL,
      passwordHash: "dev-skip",
      teamName: "Dev Team",
      createdAt: now(),
      updatedAt: now(),
    }) as Coach;
  }
  return coach.id;
}
