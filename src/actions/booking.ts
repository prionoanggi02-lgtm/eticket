"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { read, transaction, write } from "@/lib/db";
import { genBookingCode, genId, genTicketCode, releaseExpired } from "@/lib/data";
import { canAccessBooking, getSession, requireSession } from "@/lib/session";
import type { Booking, FormState } from "@/lib/types";
import { bookingSchema } from "@/lib/validations";
import { PAYMENT_METHODS, PAYMENT_WINDOW_MIN } from "@/lib/constants";

export async function createBooking(_: FormState, formData: FormData): Promise<FormState> {
  const session = await getSession();
  if (!session) return { error: "Sesi berakhir, silakan login kembali" };

  const values = Object.fromEntries(
    [...formData.entries()].filter(([k]) => !k.startsWith("$")).map(([k, v]) => [k, String(v)]),
  );
  const pax = Math.min(9, Math.max(1, Number(formData.get("pax")) || 1));
  const parsed = bookingSchema.safeParse({
    scheduleId: formData.get("scheduleId"),
    contactName: formData.get("contactName"),
    contactEmail: formData.get("contactEmail"),
    contactPhone: formData.get("contactPhone"),
    passengers: Array.from({ length: pax }, (_, i) => ({
      fullName: formData.get(`p${i}_name`),
      idNumber: formData.get(`p${i}_id`),
    })),
  });
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const idx = issue.path[0] === "passengers" ? ` (penumpang ${Number(issue.path[1]) + 1})` : "";
    return { error: issue.message + idx, values };
  }
  const data = parsed.data;

  // Transaksi: cek & kunci kursi lalu simpan booking
  const result = await transaction(async () => {
    const [schedules, bookings] = await Promise.all([read("schedules"), read("bookings")]);
    releaseExpired(bookings, schedules);

    const schedule = schedules.find((s) => s.id === data.scheduleId);
    if (!schedule) return { error: "Jadwal tidak ditemukan" };
    if (new Date(schedule.departureAt) <= new Date()) return { error: "Jadwal sudah berangkat" };
    if (schedule.totalSeats - schedule.bookedSeats < data.passengers.length) {
      return { error: "Kursi tidak mencukupi, silakan pilih jadwal lain" };
    }

    schedule.bookedSeats += data.passengers.length;
    let code = genBookingCode();
    while (bookings.some((b) => b.code === code)) code = genBookingCode();

    const now = new Date();
    const booking: Booking = {
      id: genId("b"),
      code,
      userId: session.userId,
      scheduleId: schedule.id,
      status: "PENDING",
      totalAmount: schedule.price * data.passengers.length,
      contactName: data.contactName,
      contactEmail: data.contactEmail,
      contactPhone: data.contactPhone,
      passengers: data.passengers.map((p) => ({
        id: genId("p"),
        ...p,
        ticketCode: null,
        ticketStatus: null,
        checkedInAt: null,
      })),
      expiresAt: new Date(now.getTime() + PAYMENT_WINDOW_MIN * 60000).toISOString(),
      paidAt: null,
      paymentMethod: null,
      createdAt: now.toISOString(),
    };
    bookings.push(booking);
    await write("schedules", schedules);
    await write("bookings", bookings);
    return { code };
  });

  if ("error" in result) return { error: result.error, values };
  redirect(`/my-bookings/${result.code}`);
}

/** Simulasi pembayaran (pengganti Midtrans selama tahap dummy). */
export async function payBooking(code: string, formData: FormData) {
  const session = await requireSession();
  const method = String(formData.get("method") ?? "");
  if (!PAYMENT_METHODS.includes(method as (typeof PAYMENT_METHODS)[number])) throw new Error("Metode tidak valid");

  await transaction(async () => {
    const [bookings, schedules] = await Promise.all([read("bookings"), read("schedules")]);
    releaseExpired(bookings, schedules);
    const booking = bookings.find((b) => b.code === code);
    if (!booking || !canAccessBooking(session, booking)) throw new Error("Booking tidak ditemukan");

    if (booking.status === "PENDING") {
      booking.status = "PAID";
      booking.paidAt = new Date().toISOString();
      booking.paymentMethod = method;
      booking.passengers = booking.passengers.map((p) => ({
        ...p,
        ticketCode: genTicketCode(),
        ticketStatus: "ACTIVE",
      }));
    }
    await write("bookings", bookings);
    await write("schedules", schedules);
  });
  revalidatePath(`/my-bookings/${code}`);
}

export async function cancelBooking(code: string) {
  const session = await requireSession();
  await transaction(async () => {
    const [bookings, schedules] = await Promise.all([read("bookings"), read("schedules")]);
    const booking = bookings.find((b) => b.code === code);
    if (!booking || !canAccessBooking(session, booking)) throw new Error("Booking tidak ditemukan");
    if (booking.status !== "PENDING" && booking.status !== "PAID") return;
    if (booking.passengers.some((p) => p.ticketStatus === "USED")) throw new Error("Tiket sudah dipakai");

    const schedule = schedules.find((s) => s.id === booking.scheduleId);
    if (schedule) {
      if (new Date(schedule.departureAt) <= new Date()) throw new Error("Jadwal sudah berangkat");
      schedule.bookedSeats = Math.max(0, schedule.bookedSeats - booking.passengers.length);
    }
    booking.status = "CANCELLED";
    booking.passengers = booking.passengers.map((p) => ({
      ...p,
      ticketStatus: p.ticketCode ? "CANCELLED" : null,
    }));
    await write("bookings", bookings);
    await write("schedules", schedules);
  });
  revalidatePath(`/my-bookings/${code}`);
}
