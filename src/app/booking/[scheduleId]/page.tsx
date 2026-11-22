import { notFound } from "next/navigation";
import { read } from "@/lib/db";
import { getScheduleDetail } from "@/lib/data";
import { durationLabel, fmtDate, fmtTime, rupiah, transportLabel } from "@/lib/format";
import { requireSession } from "@/lib/session";
import { BookingForm } from "./BookingForm";

type Props = {
  params: Promise<{ scheduleId: string }>;
  searchParams: Promise<{ pax?: string }>;
};

export default async function BookingPage({ params, searchParams }: Props) {
  const { scheduleId } = await params;
  const pax = Math.min(9, Math.max(1, Number((await searchParams).pax) || 1));
  const session = await requireSession({ next: `/booking/${scheduleId}?pax=${pax}` });

  const schedule = await getScheduleDetail(scheduleId);
  if (!schedule) notFound();
  const me = (await read("users")).find((u) => u.id === session.userId);
  const left = schedule.totalSeats - schedule.bookedSeats;
  const departed = new Date(schedule.departureAt) <= new Date();

  // Customer: data kontak diisi otomatis. Agen: mengisi data pelanggannya.
  const defaultContact =
    session.role === "CUSTOMER" && me
      ? { contactName: me.name, contactEmail: me.email, contactPhone: me.phone ?? "" }
      : {};

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Isi Data Pemesanan</h1>
        {session.role === "AGENT" && (
          <p className="alert-success">Anda memesan sebagai <b>agen</b>. Isi data kontak pelanggan Anda; komisi dihitung otomatis.</p>
        )}
        {departed || left < pax ? (
          <p className="alert-error">{departed ? "Jadwal ini sudah berangkat." : `Sisa kursi hanya ${left}.`}</p>
        ) : (
          <BookingForm scheduleId={schedule.id} pax={pax} price={schedule.price} defaultContact={defaultContact} />
        )}
      </div>

      <aside className="card h-fit space-y-3 lg:sticky lg:top-20">
        <p className="text-sm font-semibold text-slate-500">Ringkasan Perjalanan</p>
        <div>
          <p className="font-semibold">{schedule.operator.name}</p>
          <p className="text-xs text-slate-500">{transportLabel[schedule.operator.type]}</p>
        </div>
        <p className="text-lg font-bold">{schedule.route.origin} → {schedule.route.destination}</p>
        <p className="text-sm">{fmtDate(schedule.departureAt)}</p>
        <p className="text-sm">{fmtTime(schedule.departureAt)} – {fmtTime(schedule.arrivalAt)} ({durationLabel(schedule.route.durationMin)})</p>
        <hr className="border-slate-200" />
        <div className="flex justify-between text-sm"><span>{rupiah(schedule.price)} × {pax}</span><span>{rupiah(schedule.price * pax)}</span></div>
        <div className="flex justify-between font-bold"><span>Total</span><span className="text-sky-700">{rupiah(schedule.price * pax)}</span></div>
      </aside>
    </div>
  );
}
