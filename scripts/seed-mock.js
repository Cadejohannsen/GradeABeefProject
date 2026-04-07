// Seed mock season: 10 games × ~20 snaps × grades for all players
const BASE = "http://localhost:3000";

const opponents = ["Whitworth","PLU","Puget Sound","Lewis & Clark","Willamette","Pacific","George Fox","Whittier","Chapman","Redlands"];
const dates = ["2025-09-06","2025-09-13","2025-09-20","2025-09-27","2025-10-04","2025-10-11","2025-10-18","2025-10-25","2025-11-01","2025-11-08"];
const playNames = ["INSIDE ZONE","OUTSIDE ZONE","POWER","COUNTER","DART","PA BOOT","PA POST","MESH","FLOOD","4 VERTS","HB DRAW","SLIP SCREEN","BUCK SWEEP","ISO","DUO","STRETCH","HITCH","SLANT","CURL FLAT","GO"];
const playTypes = ["run","run","run","pass","pass","pass","draw-screen"];

function rand(min, max) { return Math.floor(Math.random() * (max - min)) + min; }
function pick(arr) { return arr[rand(0, arr.length)]; }

async function main() {
  // Delete existing games first
  const existingGames = await fetch(`${BASE}/api/games`).then(r => r.json());
  for (const g of existingGames) {
    await fetch(`${BASE}/api/games/${g.id}`, { method: "DELETE" });
  }
  console.log(`Deleted ${existingGames.length} existing games`);

  // Get players
  const players = await fetch(`${BASE}/api/players`).then(r => r.json());
  console.log(`Found ${players.length} players`);

  for (let g = 0; g < 10; g++) {
    // Create game
    const game = await fetch(`${BASE}/api/games`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ opponent: opponents[g], date: dates[g], weekNumber: g + 1 }),
    }).then(r => r.json());
    console.log(`Game ${g+1} vs ${opponents[g]} (${game.id})`);

    // Add 18-26 snaps with grades
    const snapCount = rand(18, 27);
    for (let s = 0; s < snapCount; s++) {
      const grades = players.map(p => ({
        playerId: p.id,
        value: rand(1, 5), // 1-4
      }));

      await fetch(`${BASE}/api/games/${game.id}/snaps`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playName: pick(playNames),
          playType: pick(playTypes),
          grades,
        }),
      });
    }

    // Add player stats (sacks, penalties, etc)
    for (const p of players) {
      await fetch(`${BASE}/api/games/${game.id}/stats`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerId: p.id,
          sacks: rand(0, 3),
          missedAssignments: rand(0, 4),
          penalties: rand(0, 2),
          pressures: rand(0, 5),
          badSnaps: rand(0, 2),
          knockdowns: rand(0, 6),
          da: rand(0, 3),
        }),
      });
    }

    console.log(`  ${snapCount} snaps + stats for ${players.length} players`);
  }

  console.log("Done! Mock season seeded.");
}

main().catch(console.error);
