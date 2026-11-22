import { deleteSchedule } from "@/actions/admin";
import { ConfirmButton } from "@/components/ui";
import { read } from "@/lib/db";
import { isFuture, listScheduleDetails } from "@/lib/data";
import { fmtDateTime, rupiah, transportLabel } from "@/lib/format";
import { requireSession } from "@/lib/session";
import { ScheduleForm } from "./ScheduleForm";

type Props = { searchParams: Promise<{ show?: string }> };

export default async function SchedulesPage({ searchParams }: Props) {
  await requireSession({ roles: ["ADMIN"] });
  const { show } = await searchParams;
  const [schedules, routes, operators, bookings] = await Promise.all([
    listScheduleDetails(),
    read("routes"),
    read("operators"),
    read("bookings"),
  ]);
  const list = schedules
    .filter((s) => show === "all" || isFuture(s.departureAt))
    .sort((a, b) => a.departureAt.localeCompare(b.departureAt));
  const hasActive = (id: string) => bookings.some((b) => b.scheduleId === id && (b.status === "PENDING" || b.status === "PAID"));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Kelola Jadwal</h1>
      <ScheduleForm routes={routes} operators={operators} />

      <div className="card overflow-x-auto p-0">
        <div className="flex items-center justify-between px-4 py-3">
          <p className="font-semibold">{list.length} jadwal {show === "all" ? "(semua)" : "mendatang"}</p>
          <a href={show === "all" ? "?" : "?show=all"} className="text-sm text-sky-700">
            {show === "all" ? "Hanya mendatang" : "Tampilkan semua"}
          </a>
        </div>
        <table className="tbl">
          <thead>
            <tr><th>Berangkat</th><th>Rute</th><th>Operator</th><th>Harga</th><th>Kursi</th><th></th></tr>
          </thead>
          <tbody>
            {list.map((s) => (
              <tr key={s.id}>
                <td className="whitespace-nowrap">{fmtDateTime(s.departureAt)}</td>
                <td>{s.route.origin} → {s.route.destination}</td>
                <td>{s.operator.name}<p className="text-xs text-slate-500">{transportLabel[s.operator.type]}</p></td>
                <td className="whitespace-nowrap">{rupiah(s.price)}</td>
                <td>{s.bookedSeats}/{s.totalSeats}</td>
                <td className="text-right">
                  {!hasActive(s.id) && (
                    <form action={deleteSchedule.bind(null, s.id)}>
                      <ConfirmButton message="Hapus jadwal ini?" className="btn-outline px-2 py-1 text-xs text-rose-600">Hapus</ConfirmButton>
                    </form>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
