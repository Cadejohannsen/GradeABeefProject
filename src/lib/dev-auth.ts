import { findFirst, create, cuid, now, type Coach, type CreateCoach } from "@/lib/json-db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const DEV_COACH_EMAIL = "dev@gradeabeef.local";

export async function getCoachId(): Promise<string> {
  // Try to get the real logged-in user from the session first
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id as string | undefined;
    if (userId) return userId;
  } catch (_) {}

  // Fallback: dev coach for unauthenticated / local dev
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
