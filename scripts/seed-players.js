const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const DEV_COACH_EMAIL = "dev@gradeabeef.local";

const players = [
  { name: "Ridge Huot", number: 54, position: "C", height: "6'2\"", weight: "250", year: "Sophomore" },
  { name: "Benson Deibele", number: 57, position: "OG", height: "5'11\"", weight: "265", year: "Sophomore" },
  { name: "Nathan Fillinger-Palotay", number: 60, position: "C", height: "6'1\"", weight: "270", year: "Junior" },
  { name: "Hunter Harding", number: 61, position: "OG", height: "5'11\"", weight: "270", year: "Sophomore" },
  { name: "Jackson Murphy", number: 62, position: "OG", height: "6'2\"", weight: "275", year: "Sophomore" },
  { name: "Preston Powers", number: 63, position: "OG", height: "6'0\"", weight: "270", year: "Junior" },
  { name: "Tanner Thomas", number: 65, position: "OT", height: "6'3\"", weight: "270", year: "Junior" },
  { name: "Tristan Kieser", number: 66, position: "OT", height: "6'4\"", weight: "265", year: "Sophomore" },
  { name: "Luca Carmichael", number: 67, position: "OT", height: "6'4\"", weight: "265", year: "Sophomore" },
  { name: "Camden Ferguson", number: 70, position: "OG", height: "6'2\"", weight: "285", year: "Junior" },
  { name: "Joey Massari", number: 71, position: "OT", height: "6'4\"", weight: "300", year: "Sophomore" },
  { name: "Alex Bobadilla", number: 72, position: "C", height: "6'0\"", weight: "275", year: "Junior" },
  { name: "Howie Smith", number: 73, position: "OT", height: "6'2\"", weight: "275", year: "Sophomore" },
  { name: "Jaden Nichols", number: 74, position: "OT", height: "6'4\"", weight: "300", year: "Sophomore" },
  { name: "A.J. Brown", number: 76, position: "C", height: "6'0\"", weight: "290", year: "Sophomore" },
];

async function seed() {
  // Find or create the dev coach
  let coach = await prisma.coach.findUnique({ where: { email: DEV_COACH_EMAIL } });
  if (!coach) {
    coach = await prisma.coach.create({
      data: { name: "Coach", email: DEV_COACH_EMAIL, passwordHash: "dev-skip", teamName: "Dev Team" },
    });
  }
  const coachId = coach.id;

  console.log(`Seeding ${players.length} OL players for coach ${coachId}...\n`);

  for (const p of players) {
    const existing = await prisma.player.findFirst({ where: { coachId, number: p.number, name: p.name } });
    if (existing) {
      console.log(`  - #${p.number} ${p.name} already exists`);
    } else {
      await prisma.player.create({ data: { coachId, ...p } });
      console.log(`  + #${p.number} ${p.name} (${p.position}, ${p.height}, ${p.weight}, ${p.year})`);
    }
  }

  console.log("\nDone!");
  await prisma.$disconnect();
}

seed();
