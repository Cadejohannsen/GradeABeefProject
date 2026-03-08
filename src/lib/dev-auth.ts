import { prisma } from "@/lib/prisma";

const DEV_COACH_EMAIL = "dev@gradeabeef.local";

export async function getCoachId(): Promise<string> {
  // Dev mode: find or create a default coach
  let coach = await prisma.coach.findUnique({ where: { email: DEV_COACH_EMAIL } });
  if (!coach) {
    coach = await prisma.coach.create({
      data: {
        name: "Coach",
        email: DEV_COACH_EMAIL,
        passwordHash: "dev-skip",
        teamName: "Dev Team",
      },
    });
  }
  return coach.id;
}
