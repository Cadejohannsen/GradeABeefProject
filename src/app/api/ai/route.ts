import { NextResponse } from "next/server";
import { getCoachId } from "@/lib/dev-auth";
import {
  findMany, findFirst, create, update, remove,
  type Player, type Game, type Season, type Coach,
  type CreatePlayer, type CreateGame, type CreateSeason,
} from "@/lib/json-db";

const MODEL = "google/gemma-3-27b-it:free";
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

function buildContext(coachId: string, year: string) {
  const coach = findFirst<Coach>("coaches", { id: coachId });
  const season = findFirst<Season>("seasons", { coachId, name: year });
  const players = findMany<Player>("players", { coachId });
  const games = season
    ? findMany<Game>("games").filter((g) => g.seasonId === season.id)
    : [];

  return {
    teamName: coach?.teamName ?? "Unknown",
    year,
    players: players.map((p) => ({
      id: p.id, name: p.name, number: p.number,
      position: p.position, height: p.height, weight: p.weight, year: p.year,
    })),
    games: games.map((g) => ({
      id: g.id, opponent: g.opponent,
      date: g.date?.split("T")[0], weekNumber: g.weekNumber,
    })),
  };
}

const SYSTEM_PROMPT = (ctx: ReturnType<typeof buildContext>) => `
You are an AI assistant for Grade-A-Beef, a football lineman grading app.
You help coaches manage their roster and schedule.

CURRENT DATA:
Team: ${ctx.teamName} | Season: ${ctx.year}
Players (${ctx.players.length}): ${JSON.stringify(ctx.players)}
Games (${ctx.games.length}): ${JSON.stringify(ctx.games)}

AVAILABLE ACTIONS — when you need to modify data, embed action blocks in your response using this exact format:
ACTION:{"type":"CREATE_PLAYER","data":{"name":"...","number":0,"position":"LT|LG|C|RG|RT|TE","height":"6-3","weight":"280","year":"Fr|So|Jr|Sr"}}
ACTION:{"type":"UPDATE_PLAYER","data":{"id":"...","name":"...","number":0,"position":"...","height":"...","weight":"...","year":"..."}}
ACTION:{"type":"DELETE_PLAYER","data":{"id":"..."}}
ACTION:{"type":"CREATE_GAME","data":{"opponent":"...","date":"YYYY-MM-DD","weekNumber":1}}
ACTION:{"type":"UPDATE_GAME","data":{"id":"...","opponent":"...","date":"YYYY-MM-DD","weekNumber":1}}
ACTION:{"type":"DELETE_GAME","data":{"id":"..."}}

Rules:
- Always confirm what you did after executing actions
- For positions use: LT, LG, C, RG, RT, TE
- For player year use: Fr, So, Jr, Sr
- Be concise and helpful
- If asked to add multiple players, emit multiple ACTION blocks
- Never invent player IDs — use the IDs from CURRENT DATA above
`.trim();

async function executeAction(
  action: { type: string; data: Record<string, unknown> },
  coachId: string,
  year: string
) {
  const { type, data } = action;

  if (type === "CREATE_PLAYER") {
    return create<CreatePlayer>("players", {
      coachId,
      name: String(data.name ?? ""),
      number: Number(data.number ?? 0),
      position: String(data.position ?? "C"),
      height: String(data.height ?? ""),
      weight: String(data.weight ?? ""),
      year: String(data.year ?? ""),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  if (type === "UPDATE_PLAYER") {
    return update<Player>("players", String(data.id), {
      name: data.name as string,
      number: data.number as number,
      position: data.position as string,
      height: data.height as string,
      weight: data.weight as string,
      year: data.year as string,
      updatedAt: new Date().toISOString(),
    });
  }

  if (type === "DELETE_PLAYER") {
    return remove("players", String(data.id));
  }

  if (type === "CREATE_GAME") {
    let season = findFirst<Season>("seasons", { coachId, name: year });
    if (!season) {
      season = create<CreateSeason>("seasons", {
        name: year, coachId, createdAt: new Date().toISOString(),
      }) as Season;
    }
    return create<CreateGame>("games", {
      seasonId: season.id,
      opponent: String(data.opponent ?? ""),
      date: new Date(String(data.date)).toISOString(),
      weekNumber: Number(data.weekNumber ?? 1),
      createdAt: new Date().toISOString(),
    });
  }

  if (type === "UPDATE_GAME") {
    return update<Game>("games", String(data.id), {
      opponent: data.opponent as string,
      date: new Date(String(data.date)).toISOString(),
      weekNumber: data.weekNumber as number,
    });
  }

  if (type === "DELETE_GAME") {
    return remove("games", String(data.id));
  }

  return null;
}

export async function POST(req: Request) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey || apiKey === "your_key_here") {
    return NextResponse.json(
      { error: "Add your OpenRouter API key to .env.local as OPENROUTER_API_KEY" },
      { status: 500 }
    );
  }

  const { messages, year } = await req.json();
  const coachId = await getCoachId();
  const ctx = buildContext(coachId, year ?? new Date().getFullYear().toString());

  const response = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://gradeabeef.local",
      "X-Title": "Grade-A-Beef",
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT(ctx) },
        ...messages,
      ],
      temperature: 0.7,
      max_tokens: 1024,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    return NextResponse.json({ error: err }, { status: response.status });
  }

  const json = await response.json();
  const content: string = json.choices?.[0]?.message?.content ?? "";

  // Parse and execute ACTION blocks
  const actionRegex = /ACTION:\s*(\{[\s\S]*?\})(?=\nACTION:|\n[^A]|$)/g;
  const executed: unknown[] = [];
  let match;
  while ((match = actionRegex.exec(content)) !== null) {
    try {
      const action = JSON.parse(match[1]);
      const result = await executeAction(action, coachId, ctx.year);
      executed.push({ action: action.type, result });
    } catch {
      // skip malformed action
    }
  }

  // Strip ACTION: lines from the displayed message
  const cleanContent = content.replace(/ACTION:\s*\{[\s\S]*?\}(?=\n|$)/g, "").trim();

  return NextResponse.json({ content: cleanContent, executed });
}
