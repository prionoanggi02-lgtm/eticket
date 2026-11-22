import { z } from "zod";

const phoneRe = /^(\+62|0)8\d{7,11}$/;

export const loginSchema = z.object({
  email: z.string().trim().email("Format email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

export const registerSchema = loginSchema.extend({
  name: z.string().trim().min(3, "Nama minimal 3 karakter"),
  phone: z.string().trim().regex(phoneRe, "Nomor HP tidak valid (contoh: 081234567890)"),
});

export const searchSchema = z
  .object({
    origin: z.string().min(1),
    destination: z.string().min(1),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    pax: z.coerce.number().int().min(1).max(9),
  })
  .refine((d) => d.origin !== d.destination, "Kota asal dan tujuan tidak boleh sama");

export const bookingSchema = z.object({
  scheduleId: z.string().min(1),
  contactName: z.string().trim().min(3, "Nama pemesan minimal 3 karakter"),
  contactEmail: z.string().trim().email("Email pemesan tidak valid"),
  contactPhone: z.string().trim().regex(phoneRe, "Nomor HP pemesan tidak valid"),
  passengers: z
    .array(
      z.object({
        fullName: z.string().trim().min(3, "Nama penumpang minimal 3 karakter"),
        idNumber: z.string().trim().min(6, "No. identitas penumpang minimal 6 karakter"),
      }),
    )
    .min(1)
    .max(9),
});

export const routeSchema = z
  .object({
    origin: z.string().trim().min(2, "Kota asal wajib diisi"),
    destination: z.string().trim().min(2, "Kota tujuan wajib diisi"),
    durationMin: z.coerce.number().int().min(10, "Durasi minimal 10 menit"),
  })
  .refine((d) => d.origin.toLowerCase() !== d.destination.toLowerCase(), "Kota asal dan tujuan tidak boleh sama");

export const scheduleSchema = z.object({
  routeId: z.string().min(1, "Pilih rute"),
  operatorId: z.string().min(1, "Pilih operator"),
  departureAt: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, "Waktu berangkat tidak valid"),
  price: z.coerce.number().min(1000, "Harga minimal Rp1.000"),
  totalSeats: z.coerce.number().int().min(1, "Kursi minimal 1").max(1000),
});
