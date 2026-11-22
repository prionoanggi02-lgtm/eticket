import { read } from "@/lib/db";
import { fmtDateTime } from "@/lib/format";
import { requireSession } from "@/lib/session";
import { CheckInForm } from "./CheckInForm";

export default async function CheckInPage() {
  await requireSession({ roles: ["ADMIN", "AGENT"] });
  const bookings = await read("bookings");
  const recent = bookings
    .flatMap((b) => b.passengers.filter((p) => p.checkedInAt).map((p) => ({ ...p, bookingCode: b.code })))
    .sort((a, b) => b.checkedInAt!.localeCompare(a.checkedInAt!))
    .slice(0, 10);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Check-in Tiket</h1>
      <CheckInForm />
      <section className="card">
        <h2 className="mb-3 font-semibold">Check-in Terakhir</h2>
        {recent.length === 0 ? (
          <p className="text-sm text-slate-500">Belum ada check-in. Coba kode demo <code>TKT-DEMO0001</code>.</p>
        ) : (
          <table className="tbl">
            <thead><tr><th>Waktu</th><th>Kode Tiket</th><th>Penumpang</th><th>Booking</th></tr></thead>
            <tbody>
              {recent.map((p) => (
                <tr key={p.id}>
                  <td>{fmtDateTime(p.checkedInAt!)}</td>
                  <td className="font-mono">{p.ticketCode}</td>
                  <td>{p.fullName}</td>
                  <td className="font-mono">{p.bookingCode}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
