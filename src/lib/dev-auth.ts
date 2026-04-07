import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const DEV_COACH_EMAIL = "dev@gradeabeef.local";

export async function getCoachId(): Promise<string> {
  // Try to get the real signed-in coach first
  const session = await getServerSession(authOptions);
  if (session?.user?.email) {
    const coach = await prisma.coach.findUnique({ where: { email: session.user.email } });
    if (coach) return coach.id;
  }

  // Fallback: dev mode — find or create a default coach
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
