/**
 * "Database" sederhana berbasis file JSON di folder /data.
 * Cocok untuk prototipe/dummy. Ganti dengan Prisma + PostgreSQL untuk produksi.
 */
import { promises as fs } from "fs";
import path from "path";
import type { Tables } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
type TableName = keyof Tables;

export async function read<N extends TableName>(name: N): Promise<Tables[N][]> {
  const raw = await fs.readFile(path.join(DATA_DIR, `${name}.json`), "utf8");
  return JSON.parse(raw) as Tables[N][];
}

export async function write<N extends TableName>(name: N, rows: Tables[N][]): Promise<void> {
  await fs.writeFile(path.join(DATA_DIR, `${name}.json`), JSON.stringify(rows, null, 2), "utf8");
}

/**
 * Menjalankan operasi baca-tulis secara berurutan (mutex sederhana) agar
 * tidak terjadi race condition, misalnya dua orang memesan kursi terakhir bersamaan.
 */
const g = globalThis as unknown as { __dbChain?: Promise<unknown> };
export function transaction<T>(fn: () => Promise<T>): Promise<T> {
  const prev = g.__dbChain ?? Promise.resolve();
  const run = prev.then(fn, fn);
  g.__dbChain = run.catch(() => undefined);
  return run;
}
