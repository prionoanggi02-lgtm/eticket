import Link from "next/link";
import { StatusBadge } from "@/components/StatusBadge";
import { read } from "@/lib/db";
import { expireStaleBookings, listScheduleDetails } from "@/lib/data";
import { fmtDateTime, rupiah } from "@/lib/format";
import { requireSession } from "@/lib/session";

export default async function MyBookingsPage() {
  const session = await requireSession({ next: "/my-bookings" });
  await expireStaleBookings();
  const [bookings, schedules] = await Promise.all([read("bookings"), listScheduleDetails()]);
  const mine = bookings
    .filter((b) => b.userId === session.userId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Pesanan Saya</h1>
      {mine.length === 0 && (
        <div className="card text-center text-slate-500">
          Belum ada pesanan. <Link href="/" className="font-semibold text-sky-700">Cari tiket sekarang</Link>
        </div>
      )}
      <div className="space-y-3">
        {mine.map((b) => {
          const s = schedules.find((x) => x.id === b.scheduleId);
          return (
            <Link key={b.id} href={`/my-bookings/${b.code}`} className="card flex flex-col gap-2 transition hover:border-sky-300 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-mono text-sm text-slate-500">{b.code}</p>
                <p className="font-semibold">{s ? `${s.route.origin} → ${s.route.destination}` : "-"}</p>
                <p className="text-sm text-slate-500">
                  {s ? `${s.operator.name} • ${fmtDateTime(s.departureAt)}` : ""} • {b.passengers.length} penumpang
                </p>
              </div>
              <div className="text-right">
                <StatusBadge status={b.status} />
                <p className="mt-1 font-bold">{rupiah(b.totalAmount)}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
