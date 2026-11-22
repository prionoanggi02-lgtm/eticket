import type { BookingStatus, TransportType } from "./types";

const TZ = "Asia/Jakarta";

export const rupiah = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

export const fmtDateTime = (iso: string) =>
  new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short", timeZone: TZ }).format(new Date(iso));

export const fmtDate = (iso: string) =>
  new Intl.DateTimeFormat("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: TZ }).format(new Date(iso));

export const fmtTime = (iso: string) =>
  new Intl.DateTimeFormat("id-ID", { hour: "2-digit", minute: "2-digit", timeZone: TZ }).format(new Date(iso));

/** yyyy-mm-dd menurut zona WIB */
export const ymdJakarta = (date: Date | string) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(new Date(date));

export const tomorrowYmd = () => ymdJakarta(new Date(Date.now() + 24 * 3600e3));

export const durationLabel = (min: number) => {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return [h ? `${h}j` : "", m ? `${m}m` : ""].filter(Boolean).join(" ");
};

export const transportLabel: Record<TransportType, string> = {
  FLIGHT: "✈️ Pesawat",
  BUS: "🚌 Bus",
  TRAIN: "🚆 Kereta",
  SHIP: "🚢 Kapal",
};

export const statusLabel: Record<BookingStatus, string> = {
  PENDING: "Menunggu Pembayaran",
  PAID: "Lunas",
  CANCELLED: "Dibatalkan",
  EXPIRED: "Kedaluwarsa",
};
