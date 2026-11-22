import Link from "next/link";
import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { PrintButton } from "@/components/ui";
import { read } from "@/lib/db";
import { getScheduleDetail } from "@/lib/data";
import { durationLabel, fmtDate, fmtDateTime, fmtTime, transportLabel } from "@/lib/format";
import { canAccessBooking, requireSession } from "@/lib/session";

type Props = { params: Promise<{ code: string }> };

export default async function TicketPage({ params }: Props) {
  const { code } = await params;
  const session = await requireSession({ next: `/tickets/${code}` });
  const booking = (await read("bookings")).find((b) => b.code === code);
  if (!booking || !canAccessBooking(session, booking) || booking.status !== "PAID") notFound();
  const s = await getScheduleDetail(booking.scheduleId);
  if (!s) notFound();

  const qrs = await Promise.all(
    booking.passengers.map((p) => QRCode.toDataURL(p.ticketCode ?? "", { margin: 1, width: 220 })),
  );

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="no-print flex items-center justify-between">
        <Link href={`/my-bookings/${booking.code}`} className="btn-outline">← Kembali</Link>
        <PrintButton />
      </div>

      {booking.passengers.map((p, i) => (
        <article key={p.id} className="overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-sm break-inside-avoid">
          <header className="flex items-center justify-between bg-sky-700 px-5 py-3 text-white">
            <p className="font-bold">🎫 NusaeTicket — E-Ticket</p>
            <p className="font-mono text-sm">Booking: {booking.code}</p>
          </header>
          <div className="grid gap-4 p-5 sm:grid-cols-[1fr_auto]">
            <div className="space-y-3">
              <div>
                <p className="text-xs text-slate-500">Penumpang</p>
                <p className="text-lg font-bold">{p.fullName}</p>
                <p className="text-xs text-slate-500">ID: {p.idNumber}</p>
              </div>
              <div className="flex items-center gap-6">
                <div>
                  <p className="text-2xl font-bold">{fmtTime(s.departureAt)}</p>
                  <p className="text-sm">{s.route.origin}</p>
                </div>
                <div className="text-xs text-slate-500">→ {durationLabel(s.route.durationMin)} →</div>
                <div>
                  <p className="text-2xl font-bold">{fmtTime(s.arrivalAt)}</p>
                  <p className="text-sm">{s.route.destination}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <p><span className="text-slate-500">Tanggal:</span> {fmtDate(s.departureAt)}</p>
                <p><span className="text-slate-500">Operator:</span> {s.operator.name}</p>
                <p><span className="text-slate-500">Moda:</span> {transportLabel[s.operator.type]}</p>
                <p><span className="text-slate-500">Status:</span> {p.ticketStatus === "USED" ? `Sudah check-in (${fmtDateTime(p.checkedInAt!)})` : p.ticketStatus}</p>
              </div>
            </div>
            <div className="text-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrs[i]} alt={`QR ${p.ticketCode}`} className="mx-auto h-40 w-40" />
              <p className="mt-1 font-mono text-sm font-semibold">{p.ticketCode}</p>
            </div>
          </div>
          <footer className="border-t border-dashed border-slate-300 px-5 py-2 text-xs text-slate-500">
            Tunjukkan QR ini kepada petugas saat check-in. Datang minimal 60 menit sebelum keberangkatan.
          </footer>
        </article>
      ))}
    </div>
  );
}
