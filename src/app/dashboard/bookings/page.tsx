import Link from "next/link";
import { StatusBadge } from "@/components/StatusBadge";
import { read } from "@/lib/db";
import { expireStaleBookings, listScheduleDetails } from "@/lib/data";
import { fmtDateTime, rupiah, statusLabel } from "@/lib/format";
import { requireSession } from "@/lib/session";
import type { BookingStatus } from "@/lib/types";

type Props = { searchParams: Promise<{ status?: string; q?: string }> };
const STATUSES = Object.keys(statusLabel) as BookingStatus[];

export default async function DashboardBookingsPage({ searchParams }: Props) {
  const session = await requireSession({ roles: ["ADMIN", "AGENT"] });
  const { status, q } = await searchParams;
  await expireStaleBookings();
  const [all, users, schedules] = await Promise.all([read("bookings"), read("users"), listScheduleDetails()]);

  const query = (q ?? "").trim().toLowerCase();
  const bookings = all
    .filter((b) => session.role === "ADMIN" || b.userId === session.userId)
    .filter((b) => !status || b.status === status)
    .filter((b) => !query || b.code.toLowerCase().includes(query) || b.contactName.toLowerCase().includes(query))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Daftar Booking</h1>

      <form className="card flex flex-wrap items-end gap-3">
        <div className="flex-1">
          <label className="label" htmlFor="q">Cari kode / nama pemesan</label>
          <input id="q" name="q" defaultValue={q} className="input" placeholder="ETK..." />
        </div>
        <div>
          <label className="label" htmlFor="status">Status</label>
          <select id="status" name="status" defaultValue={status ?? ""} className="input">
            <option value="">Semua</option>
            {STATUSES.map((s) => <option key={s} value={s}>{statusLabel[s]}</option>)}
          </select>
        </div>
        <button className="btn">Filter</button>
      </form>

      <div className="card overflow-x-auto p-0">
        <table className="tbl">
          <thead>
            <tr><th>Kode</th><th>Pemesan</th><th>Perjalanan</th><th>Pax</th><th>Total</th><th>Status</th>{session.role === "ADMIN" && <th>Dibuat oleh</th>}</tr>
          </thead>
          <tbody>
            {bookings.length === 0 && (
              <tr><td colSpan={7} className="py-6 text-center text-slate-500">Tidak ada data.</td></tr>
            )}
            {bookings.map((b) => {
              const s = schedules.find((x) => x.id === b.scheduleId);
              const creator = users.find((u) => u.id === b.userId);
              return (
                <tr key={b.id}>
                  <td><Link href={`/my-bookings/${b.code}`} className="font-mono text-sky-700">{b.code}</Link></td>
                  <td>{b.contactName}<p className="text-xs text-slate-500">{b.contactPhone}</p></td>
                  <td>
                    {s ? `${s.route.origin} → ${s.route.destination}` : "-"}
                    <p className="text-xs text-slate-500">{s ? `${s.operator.name} • ${fmtDateTime(s.departureAt)}` : ""}</p>
                  </td>
                  <td>{b.passengers.length}</td>
                  <td className="whitespace-nowrap">{rupiah(b.totalAmount)}</td>
                  <td><StatusBadge status={b.status} /></td>
                  {session.role === "ADMIN" && <td>{creator?.name ?? "-"}<p className="text-xs text-slate-500">{creator?.role}</p></td>}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
