import { customAlphabet } from "nanoid";
import { read, transaction, write } from "./db";
import type { Booking, Schedule, ScheduleDetail } from "./types";

const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export const genBookingCode = () => `ETK${customAlphabet(alphabet, 5)()}`;
export const genTicketCode = () => `TKT-${customAlphabet(alphabet, 8)()}`;
export const genId = (prefix: string) => `${prefix}_${customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 10)()}`;

/** Ubah booking PENDING yang lewat batas bayar jadi EXPIRED & kembalikan kursinya (mutasi in-place). */
export function releaseExpired(bookings: Booking[], schedules: Schedule[]): boolean {
  const now = Date.now();
  let changed = false;
  for (const b of bookings) {
    if (b.status === "PENDING" && new Date(b.expiresAt).getTime() < now) {
      b.status = "EXPIRED";
      const s = schedules.find((x) => x.id === b.scheduleId);
      if (s) s.bookedSeats = Math.max(0, s.bookedSeats - b.passengers.length);
      changed = true;
    }
  }
  return changed;
}

export function expireStaleBookings() {
  return transaction(async () => {
    const [bookings, schedules] = await Promise.all([read("bookings"), read("schedules")]);
    if (releaseExpired(bookings, schedules)) {
      await write("bookings", bookings);
      await write("schedules", schedules);
    }
  });
}

export async function listScheduleDetails(): Promise<ScheduleDetail[]> {
  const [schedules, routes, operators] = await Promise.all([read("schedules"), read("routes"), read("operators")]);
  return schedules.flatMap((s) => {
    const route = routes.find((r) => r.id === s.routeId);
    const operator = operators.find((o) => o.id === s.operatorId);
    return route && operator ? [{ ...s, route, operator }] : [];
  });
}

export async function getScheduleDetail(id: string): Promise<ScheduleDetail | null> {
  return (await listScheduleDetails()).find((s) => s.id === id) ?? null;
}

export async function listCities(): Promise<string[]> {
  const routes = await read("routes");
  return [...new Set(routes.flatMap((r) => [r.origin, r.destination]))].sort();
}
