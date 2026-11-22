"use server";

import { revalidatePath } from "next/cache";
import { read, transaction, write } from "@/lib/db";
import { genId } from "@/lib/data";
import { requireSession } from "@/lib/session";
import type { FormState } from "@/lib/types";
import { routeSchema, scheduleSchema } from "@/lib/validations";

export async function createRoute(_: FormState, formData: FormData): Promise<FormState> {
  await requireSession({ roles: ["ADMIN"] });
  const parsed = routeSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const result = await transaction(async () => {
    const routes = await read("routes");
    const dup = routes.some(
      (r) =>
        r.origin.toLowerCase() === parsed.data.origin.toLowerCase() &&
        r.destination.toLowerCase() === parsed.data.destination.toLowerCase(),
    );
    if (dup) return { error: "Rute sudah ada" };
    routes.push({ id: genId("r"), ...parsed.data });
    await write("routes", routes);
    return {};
  });
  if ("error" in result) return result;
  revalidatePath("/dashboard/routes");
  return { success: "Rute berhasil ditambahkan" };
}

export async function createSchedule(_: FormState, formData: FormData): Promise<FormState> {
  await requireSession({ roles: ["ADMIN"] });
  const parsed = scheduleSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const data = parsed.data;

  // input datetime-local dianggap WIB (UTC+7)
  const departure = new Date(`${data.departureAt}:00+07:00`);
  if (departure <= new Date()) return { error: "Waktu berangkat harus di masa depan" };

  const result = await transaction(async () => {
    const [schedules, routes, operators] = await Promise.all([read("schedules"), read("routes"), read("operators")]);
    const route = routes.find((r) => r.id === data.routeId);
    if (!route) return { error: "Rute tidak ditemukan" };
    if (!operators.some((o) => o.id === data.operatorId)) return { error: "Operator tidak ditemukan" };
    schedules.push({
      id: genId("s"),
      routeId: route.id,
      operatorId: data.operatorId,
      departureAt: departure.toISOString(),
      arrivalAt: new Date(departure.getTime() + route.durationMin * 60000).toISOString(),
      price: data.price,
      totalSeats: data.totalSeats,
      bookedSeats: 0,
    });
    await write("schedules", schedules);
    return {};
  });
  if ("error" in result) return result;
  revalidatePath("/dashboard/schedules");
  return { success: "Jadwal berhasil ditambahkan" };
}

export async function deleteSchedule(id: string) {
  await requireSession({ roles: ["ADMIN"] });
  await transaction(async () => {
    const [schedules, bookings] = await Promise.all([read("schedules"), read("bookings")]);
    const active = bookings.some((b) => b.scheduleId === id && (b.status === "PENDING" || b.status === "PAID"));
    if (active) throw new Error("Jadwal memiliki booking aktif dan tidak bisa dihapus");
    await write("schedules", schedules.filter((s) => s.id !== id));
  });
  revalidatePath("/dashboard/schedules");
}
