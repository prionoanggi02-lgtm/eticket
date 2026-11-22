import Link from "next/link";
import { notFound } from "next/navigation";
import { cancelBooking, payBooking } from "@/actions/booking";
import { PAYMENT_METHODS } from "@/lib/constants";
import { StatusBadge } from "@/components/StatusBadge";
import { ConfirmButton, SubmitButton } from "@/components/ui";
import { read } from "@/lib/db";
import { expireStaleBookings, getScheduleDetail } from "@/lib/data";
import { durationLabel, fmtDate, fmtDateTime, fmtTime, rupiah, transportLabel } from "@/lib/format";
import { canAccessBooking, requireSession } from "@/lib/session";

type Props = { params: Promise<{ code: string }> };

export default async function BookingDetailPage({ params }: Props) {
  const { code } = await params;
  const session = await requireSession({ next: `/my-bookings/${code}` });
  await expireStaleBookings();

  const booking = (await read("bookings")).find((b) => b.code === code);
  if (!booking || !canAccessBooking(session, booking)) notFound();
  const s = await getScheduleDetail(booking.scheduleId);
  if (!s) notFound();

  const departed = new Date(s.departureAt) <= new Date();
  const canCancel =
    !departed &&
    (booking.status === "PENDING" || booking.status === "PAID") &&
    !booking.passengers.some((p) => p.ticketStatus === "USED");

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-sm text-slate-500">Kode Booking</p>
            <h1 className="font-mono text-3xl font-bold tracking-wider">{booking.code}</h1>
          </div>
          <StatusBadge status={booking.status} />
        </div>

        <section className="card space-y-2">
          <p className="text-sm text-slate-500">{s.operator.name} • {transportLabel[s.operator.type]}</p>
          <p className="text-xl font-bold">{s.route.origin} → {s.route.destination}</p>
          <p>{fmtDate(s.departureAt)}</p>
          <p className="text-sm text-slate-600">
            {fmtTime(s.departureAt)} – {fmtTime(s.arrivalAt)} WIB ({durationLabel(s.route.durationMin)})
          </p>
        </section>

        <section className="card">
          <h2 className="mb-3 font-semibold">Penumpang</h2>
          <table className="tbl">
            <thead>
              <tr><th>#</th><th>Nama</th><th>No. Identitas</th><th>Kode Tiket</th><th>Status</th></tr>
            </thead>
            <tbody>
              {booking.passengers.map((p, i) => (
                <tr key={p.id}>
                  <td>{i + 1}</td>
                  <td>{p.fullName}</td>
                  <td>{p.idNumber}</td>
                  <td className="font-mono">{p.ticketCode ?? "-"}</td>
                  <td>{p.ticketStatus === "USED" ? `Check-in ${fmtDateTime(p.checkedInAt!)}` : (p.ticketStatus ?? "-")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="card text-sm text-slate-600">
          <p><b>Pemesan:</b> {booking.contactName} • {booking.contactEmail} • {booking.contactPhone}</p>
          <p><b>Dipesan:</b> {fmtDateTime(booking.createdAt)}</p>
          {booking.paidAt && <p><b>Dibayar:</b> {fmtDateTime(booking.paidAt)} via {booking.paymentMethod}</p>}
        </section>
      </div>

      <aside className="h-fit space-y-4 lg:sticky lg:top-20">
        <div className="card space-y-3">
          <div className="flex justify-between font-bold">
            <span>Total</span><span className="text-sky-700">{rupiah(booking.totalAmount)}</span>
          </div>

          {booking.status === "PENDING" && (
            <>
              <p className="alert-error">Bayar sebelum <b>{fmtDateTime(booking.expiresAt)}</b> atau pesanan otomatis dibatalkan.</p>
              <p className="text-sm font-semibold">Pilih metode pembayaran (simulasi):</p>
              <form action={payBooking.bind(null, booking.code)} className="grid gap-2">
                {PAYMENT_METHODS.map((m) => (
                  <SubmitButton key={m} name="method" value={m} className="btn-outline justify-start">💳 {m}</SubmitButton>
                ))}
              </form>
            </>
          )}

          {booking.status === "PAID" && (
            <Link href={`/tickets/${booking.code}`} className="btn w-full">🎫 Lihat E-Ticket</Link>
          )}

          {canCancel && (
            <form action={cancelBooking.bind(null, booking.code)}>
              <ConfirmButton message="Yakin ingin membatalkan pesanan ini?" className="btn-danger w-full">Batalkan Pesanan</ConfirmButton>
            </form>
          )}
        </div>
        <Link href="/my-bookings" className="btn-outline w-full">← Semua Pesanan</Link>
      </aside>
    </div>
  );
}
