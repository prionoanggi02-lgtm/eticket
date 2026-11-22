import Link from "next/link";
import { StatusBadge } from "@/components/StatusBadge";
import { read } from "@/lib/db";
import { expireStaleBookings, listScheduleDetails } from "@/lib/data";
import { fmtDateTime, rupiah } from "@/lib/format";
import { requireSession } from "@/lib/session";

export default async function DashboardPage() {
  const session = await requireSession({ roles: ["ADMIN", "AGENT"] });
  await expireStaleBookings();
  const [allBookings, users, schedules] = await Promise.all([read("bookings"), read("users"), listScheduleDetails()]);
  const me = users.find((u) => u.id === session.userId);

  const bookings = session.role === "ADMIN" ? allBookings : allBookings.filter((b) => b.userId === session.userId);
  const paid = bookings.filter((b) => b.status === "PAID");
  const revenue = paid.reduce((sum, b) => sum + b.totalAmount, 0);
  const tickets = paid.flatMap((b) => b.passengers);
  const checkedIn = tickets.filter((p) => p.ticketStatus === "USED").length;

  const stats: [string, string | number][] = [
    [session.role === "ADMIN" ? "Total Pendapatan" : "Total Penjualan", rupiah(revenue)],
    ["Booking Lunas", paid.length],
    ["Menunggu Bayar", bookings.filter((b) => b.status === "PENDING").length],
    ["Tiket Check-in", `${checkedIn}/${tickets.length}`],
  ];
  if (session.role === "AGENT") stats.push([`Komisi (${me?.commissionRate ?? 0}%)`, rupiah((revenue * (me?.commissionRate ?? 0)) / 100)]);
  if (session.role === "ADMIN") {
    const upcoming = schedules.filter((s) => new Date(s.departureAt) > new Date());
    stats.push(["Jadwal Mendatang", upcoming.length]);
  }

  // Penjualan per rute
  const perRoute = new Map<string, { count: number; total: number }>();
  for (const b of paid) {
    const s = schedules.find((x) => x.id === b.scheduleId);
    const key = s ? `${s.route.origin} → ${s.route.destination}` : "-";
    const cur = perRoute.get(key) ?? { count: 0, total: 0 };
    perRoute.set(key, { count: cur.count + b.passengers.length, total: cur.total + b.totalAmount });
  }
  const recent = [...bookings].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 6);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Halo, {session.name} 👋</h1>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map(([label, value]) => (
          <div key={label} className="card">
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-1 text-2xl font-bold">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="card">
          <h2 className="mb-3 font-semibold">Penjualan per Rute</h2>
          {perRoute.size === 0 ? (
            <p className="text-sm text-slate-500">Belum ada penjualan.</p>
          ) : (
            <table className="tbl">
              <thead><tr><th>Rute</th><th>Tiket</th><th className="text-right">Total</th></tr></thead>
              <tbody>
                {[...perRoute.entries()].sort((a, b) => b[1].total - a[1].total).map(([route, v]) => (
                  <tr key={route}><td>{route}</td><td>{v.count}</td><td className="text-right">{rupiah(v.total)}</td></tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <section className="card">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold">Booking Terbaru</h2>
            <Link href="/dashboard/bookings" className="text-sm text-sky-700">Lihat semua →</Link>
          </div>
          <table className="tbl">
            <tbody>
              {recent.map((b) => (
                <tr key={b.id}>
                  <td><Link href={`/my-bookings/${b.code}`} className="font-mono text-sky-700">{b.code}</Link></td>
                  <td>{b.contactName}<p className="text-xs text-slate-500">{fmtDateTime(b.createdAt)}</p></td>
                  <td className="text-right"><StatusBadge status={b.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}
