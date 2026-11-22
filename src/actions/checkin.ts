"use server";

import { revalidatePath } from "next/cache";
import { read, transaction, write } from "@/lib/db";
import { fmtDateTime } from "@/lib/format";
import { requireSession } from "@/lib/session";

export type CheckInState =
  | { ok: boolean; message: string; passenger?: string; bookingCode?: string; route?: string }
  | undefined;

export async function checkIn(_: CheckInState, formData: FormData): Promise<CheckInState> {
  await requireSession({ roles: ["ADMIN", "AGENT"] });
  const code = String(formData.get("code") ?? "").trim().toUpperCase();
  if (!code) return { ok: false, message: "Masukkan kode tiket" };

  const result = await transaction(async (): Promise<CheckInState> => {
    const [bookings, schedules, routes] = await Promise.all([read("bookings"), read("schedules"), read("routes")]);
    const booking = bookings.find((b) => b.passengers.some((p) => p.ticketCode === code));
    const passenger = booking?.passengers.find((p) => p.ticketCode === code);
    if (!booking || !passenger) return { ok: false, message: "Tiket tidak ditemukan" };

    const schedule = schedules.find((s) => s.id === booking.scheduleId);
    const route = routes.find((r) => r.id === schedule?.routeId);
    const info = {
      passenger: passenger.fullName,
      bookingCode: booking.code,
      route: route && schedule ? `${route.origin} → ${route.destination} • ${fmtDateTime(schedule.departureAt)}` : "-",
    };

    if (booking.status !== "PAID") return { ok: false, message: "Booking belum lunas / dibatalkan", ...info };
    if (passenger.ticketStatus === "CANCELLED") return { ok: false, message: "Tiket sudah dibatalkan", ...info };
    if (passenger.ticketStatus === "USED") {
      return { ok: false, message: `Tiket sudah check-in pada ${fmtDateTime(passenger.checkedInAt!)}`, ...info };
    }

    passenger.ticketStatus = "USED";
    passenger.checkedInAt = new Date().toISOString();
    await write("bookings", bookings);
    return { ok: true, message: "Check-in berhasil", ...info };
  });

  revalidatePath("/dashboard/check-in");
  return result;
}
