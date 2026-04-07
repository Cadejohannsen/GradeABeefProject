const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const COACH_ID = "cmnp0ithf0002p1ysrufxuqvl"; // Cade's account

const players = [
  { name: "Nic Fortney",              number: 53, position: "OT",    height: '6\'2"',  weight: "300", year: "Junior" },
  { name: "Ridge Huot",               number: 54, position: "C",     height: '6\'2"',  weight: "250", year: "Sophomore" },
  { name: "Tanner Relling",           number: 56, position: "OT",    height: '6\'5"',  weight: "260", year: "Senior" },
  { name: "Dawson Relling",           number: 59, position: "OT",    height: '6\'2"',  weight: "250", year: "Freshman" },
  { name: "Nathan Fillinger-Palotay", number: 60, position: "OG/LS", height: '6\'1"',  weight: "270", year: "Junior" },
  { name: "Hunter Harding",           number: 61, position: "OG",    height: '5\'11"', weight: "270", year: "Sophomore" },
  { name: "Jackson Murphy",           number: 62, position: "OG",    height: '6\'2"',  weight: "275", year: "Sophomore" },
  { name: "Preston Powers",           number: 63, position: "OG",    height: '6\'0"',  weight: "270", year: "Junior" },
  { name: "Tanner Thomas",            number: 65, position: "OT",    height: '6\'3"',  weight: "270", year: "Junior" },
  { name: "Tristan Kieser",           number: 66, position: "OT",    height: '6\'4"',  weight: "265", year: "Sophomore" },
  { name: "Luca Carmichael",          number: 67, position: "OT",    height: '6\'4"',  weight: "265", year: "Sophomore" },
  { name: "Jonathan Hinson",          number: 69, position: "C",     height: '6\'5"',  weight: "339", year: "Freshman" },
  { name: "Camden Ferguson",          number: 70, position: "OG",    height: '6\'2"',  weight: "285", year: "Junior" },
  { name: "Joey Massari",             number: 71, position: "OT",    height: '6\'4"',  weight: "300", year: "Sophomore" },
  { name: "Alex Bobadilla",           number: 72, position: "C",     height: '6\'0"',  weight: "275", year: "Junior" },
  { name: "Howie Smith",              number: 73, position: "OT",    height: '6\'2"',  weight: "275", year: "Sophomore" },
  { name: "Jaden Nichols",            number: 74, position: "OG",    height: '6\'4"',  weight: "300", year: "Sophomore" },
  { name: "Dylan Howell",             number: 75, position: "C",     height: '6\'0"',  weight: "275", year: "Sophomore" },
  { name: "A.J. Brown",               number: 76, position: "OG",    height: '6\'0"',  weight: "290", year: "Sophomore" },
  { name: "Will Burelle",             number: 77, position: "OT",    height: '6\'6"',  weight: "350", year: "Freshman" },
  { name: "Cordell Prevett",          number: 78, position: "OG",    height: '6\'6"',  weight: "320", year: "Freshman" },
  { name: "Tyler Alexander",          number: 79, position: "OG",    height: '6\'1"',  weight: "295", year: "Freshman" },
];

async function seed() {
  console.log("Adding " + players.length + " OL players to Cade's account...\n");

  for (const p of players) {
    const existing = await prisma.player.findFirst({
      where: { coachId: COACH_ID, number: p.number, name: p.name },
    });
    if (existing) {
      console.log("  - #" + p.number + " " + p.name + " already exists");
    } else {
      await prisma.player.create({ data: { coachId: COACH_ID, ...p } });
      console.log("  + #" + p.number + " " + p.name + " (" + p.position + ", " + p.height + ", " + p.weight + " lbs, " + p.year + ")");
    }
  }

  console.log("\nDone!");
  await prisma.$disconnect();
}

seed();
