import fs from "fs";
import path from "path";
import crypto from "crypto";

// ── Types ──────────────────────────────────────────────────────────

export interface Coach {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  teamName: string;
  primaryColor?: string;
  logoDataUrl?: string;
  videoUrls?: {
    login?: string;
    selectYear?: string;
    signin?: string;
    register?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateCoach {
  id?: string;
  name: string;
  email: string;
  passwordHash: string;
  teamName: string;
  createdAt: string;
  updatedAt: string;
}

export interface Player {
  id: string;
  coachId: string;
  name: string;
  number: number;
  position: string;
  height: string;
  weight: string;
  year: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePlayer {
  id?: string;
  coachId: string;
  name: string;
  number: number;
  position: string;
  height: string;
  weight: string;
  year: string;
  createdAt: string;
  updatedAt: string;
}

export interface Season {
  id: string;
  name: string;
  coachId: string;
  createdAt: string;
}

export interface CreateSeason {
  id?: string;
  name: string;
  coachId: string;
  createdAt: string;
}

export interface Game {
  id: string;
  seasonId: string;
  opponent: string;
  date: string;
  weekNumber: number;
  createdAt: string;
}

export interface CreateGame {
  id?: string;
  seasonId: string;
  opponent: string;
  date: string;
  weekNumber: number;
  createdAt: string;
}

export interface GameSnap {
  id: string;
  gameId: string;
  snapNumber: number;
  playName: string;
  playType: string;
  scheme: string;
  te: number;
  xtkl: number;
  xtkl2: number;
  comment: string;
  createdAt: string;
}

export interface CreateGameSnap {
  id?: string;
  gameId: string;
  snapNumber: number;
  playName: string;
  playType: string;
  scheme: string;
  te: number;
  xtkl: number;
  xtkl2: number;
  comment: string;
  createdAt: string;
}

export interface SnapGrade {
  id: string;
  snapId: string;
  playerId: string;
  value: number;
}

export interface CreateSnapGrade {
  id?: string;
  snapId: string;
  playerId: string;
  value: number;
}

export interface GamePlayerStats {
  id: string;
  gameId: string;
  playerId: string;
  sacks: number;
  missedAssignments: number;
  penalties: number;
  pressures: number;
  badSnaps: number;
  knockdowns: number;
  da: number;
}

export interface CreateGamePlayerStats {
  id?: string;
  gameId: string;
  playerId: string;
  sacks: number;
  missedAssignments: number;
  penalties: number;
  pressures: number;
  badSnaps: number;
  knockdowns: number;
  da: number;
}

export interface Formation {
  id: string;
  coachId: string;
  name: string;
  category: string;
}

export interface CreateFormation {
  id?: string;
  coachId: string;
  name: string;
  category: string;
}

export interface Play {
  id: string;
  formationId: string;
  name: string;
  category: string;
  down: string;
  distance: string;
  createdAt: string;
}

export interface CreatePlay {
  id?: string;
  formationId: string;
  name: string;
  category: string;
  down: string;
  distance: string;
  createdAt: string;
}

export interface PlayCall {
  id: string;
  playId: string;
  name: string;
  createdAt: string;
}

export interface CreatePlayCall {
  id?: string;
  playId: string;
  name: string;
  createdAt: string;
}

export interface Grade {
  id: string;
  playCallId: string;
  gameId: string;
  playerId: string;
  value: number;
  techniqueGrade: number;
  missedAssignment: boolean;
  knockdown: boolean;
  createdAt: string;
}

export interface CreateGrade {
  id?: string;
  playCallId: string;
  gameId: string;
  playerId: string;
  value: number;
  techniqueGrade: number;
  missedAssignment: boolean;
  knockdown: boolean;
  createdAt: string;
}

export interface DbData {
  coaches: Coach[];
  players: Player[];
  seasons: Season[];
  games: Game[];
  gameSnaps: GameSnap[];
  snapGrades: SnapGrade[];
  gamePlayerStats: GamePlayerStats[];
  formations: Formation[];
  plays: Play[];
  playCalls: PlayCall[];
  grades: Grade[];
}

// ── File path ──────────────────────────────────────────────────────

const DB_PATH = path.join(process.cwd(), "data", "db.json");

// ── Helpers ────────────────────────────────────────────────────────

export function cuid(): string {
  return crypto.randomBytes(12).toString("hex");
}

export function now(): string {
  return new Date().toISOString();
}

// ── Read / Write ───────────────────────────────────────────────────

const EMPTY_DB: DbData = {
  coaches: [],
  players: [],
  seasons: [],
  games: [],
  gameSnaps: [],
  snapGrades: [],
  gamePlayerStats: [],
  formations: [],
  plays: [],
  playCalls: [],
  grades: [],
};

export function readDb(): DbData {
  try {
    const raw = fs.readFileSync(DB_PATH, "utf-8");
    return { ...EMPTY_DB, ...JSON.parse(raw) };
  } catch {
    return { ...EMPTY_DB };
  }
}

export function writeDb(data: DbData): void {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// ── Generic CRUD helpers ───────────────────────────────────────────

type Collection = keyof DbData;

export function findMany<T>(collection: Collection, filter?: Partial<T>): T[] {
  const db = readDb();
  let items = db[collection] as unknown as T[];
  if (filter) {
    items = items.filter((item) => {
      return Object.entries(filter).every(
        ([key, val]) => (item as any)[key] === val
      );
    });
  }
  return items;
}

export function findFirst<T>(collection: Collection, filter: Partial<T>): T | null {
  const items = findMany<T>(collection, filter);
  return items[0] ?? null;
}

export function findUnique<T extends { id: string }>(collection: Collection, id: string): T | null {
  const db = readDb();
  const items = db[collection] as unknown as T[];
  return items.find((item) => item.id === id) ?? null;
}

export function findUniqueByEmail<T extends { email: string }>(collection: Collection, email: string): T | null {
  const db = readDb();
  const items = db[collection] as unknown as T[];
  return items.find((item) => item.email === email) ?? null;
}

export function create<T extends { id?: string }>(collection: Collection, data: T): T {
  const db = readDb();
  const record = { ...data, id: data.id || cuid() } as T;
  (db[collection] as unknown as T[]).push(record);
  writeDb(db);
  return record;
}

export function update<T extends { id: string }>(collection: Collection, id: string, data: Partial<T>): T | null {
  const db = readDb();
  const items = db[collection] as unknown as T[];
  const idx = items.findIndex((item) => item.id === id);
  if (idx === -1) return null;
  items[idx] = { ...items[idx], ...data };
  writeDb(db);
  return items[idx];
}

export function remove(collection: Collection, id: string): boolean {
  const db = readDb();
  const items = db[collection] as unknown as { id: string }[];
  const idx = items.findIndex((item) => item.id === id);
  if (idx === -1) return false;
  items.splice(idx, 1);
  writeDb(db);
  return true;
}

// Cascade delete — removes items from a child collection where a field matches
export function removeWhere<T>(collection: Collection, field: keyof T, value: string): number {
  const db = readDb();
  const items = db[collection] as unknown as T[];
  const before = items.length;
  (db[collection] as unknown as T[]) = items.filter((item) => (item as any)[field] !== value) as any;
  const removed = before - (db[collection] as unknown as T[]).length;
  if (removed > 0) writeDb(db);
  return removed;
}
