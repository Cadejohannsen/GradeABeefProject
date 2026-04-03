import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCoachId } from "@/lib/dev-auth";

const PLAY_TYPES = ["run", "run", "run", "pass", "pass", "draw-screen"] as const;
const PLAY_NAMES = [
  "Inside Zone", "Outside Zone", "Power", "Counter", "Trap",
  "PA Boot", "Dropback", "RPO", "Jet Sweep", "Draw", "Screen Left", "Screen Right",
];

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Weighted random grade — biased toward good grades (3s and 4s)
function randomGrade(): number {
  const r = Math.random();
  if (r < 0.45) return 4;
  if (r < 0.75) return 3;
  if (r < 0.90) return 2;
  return 1;
}

export async function GET() {
  const coachId = await getCoachId();

  // Get the coach's season (or create one)
  let season = await prisma.season.findFirst({ where: { coachId } });
  if (!season) {
    season = await prisma.season.create({
      data: { coachId, name: "2025 Season" },
    });
  }

  // Get all players for this coach
  const players = await prisma.player.findMany({ where: { coachId } });
  if (players.length === 0) {
    return NextResponse.json({ error: "No players found. Add players first." }, { status: 400 });
  }

  const games = [
    { opponent: "Lewis & Clark",  weekNumber: 1, date: new Date("2025-09-06") },
    { opponent: "Whitworth",      weekNumber: 2, date: new Date("2025-09-13") },
    { opponent: "Pacific Lutheran", weekNumber: 3, date: new Date("2025-09-20") },
  ];

  const createdGames = [];

  for (const g of games) {
    // Skip if already exists
    const existing = await prisma.game.findFirst({
      where: { seasonId: season.id, weekNumber: g.weekNumber },
    });
    if (existing) { createdGames.push(existing); continue; }

    const game = await prisma.game.create({
      data: { seasonId: season.id, opponent: g.opponent, weekNumber: g.weekNumber, date: g.date },
    });

    const snapCount = rand(28, 38);

    for (let i = 1; i <= snapCount; i++) {
      const playType = PLAY_TYPES[rand(0, PLAY_TYPES.length - 1)];
      const playName = PLAY_NAMES[rand(0, PLAY_NAMES.length - 1)];

      const snap = await prisma.gameSnap.create({
        data: { gameId: game.id, snapNumber: i, playName, playType },
      });

      // Grade every player on every snap
      for (const p of players) {
        await prisma.snapGrade.create({
          data: { snapId: snap.id, playerId: p.id, value: randomGrade() },
        });
      }
    }

    // Game-level stats per player
    for (const p of players) {
      await prisma.gamePlayerStats.upsert({
        where: { gameId_playerId: { gameId: game.id, playerId: p.id } },
        create: {
          gameId: game.id,
          playerId: p.id,
          sacks:             rand(0, 1),
          missedAssignments: rand(0, 3),
          penalties:         rand(0, 2),
          pressures:         rand(0, 2),
          badSnaps:          rand(0, 1),
          knockdowns:        rand(0, 4),
          da:                rand(0, 2),
        },
        update: {},
      });
    }

    createdGames.push(game);
  }

  return NextResponse.json({
    message: `Seeded ${createdGames.length} games with snaps and grades for ${players.length} players.`,
    games: createdGames.map((g) => ({ id: g.id, opponent: g.opponent, weekNumber: g.weekNumber })),
  });
}
