import { read } from "@/lib/db";
import { durationLabel } from "@/lib/format";
import { requireSession } from "@/lib/session";
import { RouteForm } from "./RouteForm";

export default async function RoutesPage() {
  await requireSession({ roles: ["ADMIN"] });
  const [routes, schedules] = await Promise.all([read("routes"), read("schedules")]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Kelola Rute</h1>
      <RouteForm />
      <div className="card overflow-x-auto p-0">
        <table className="tbl">
          <thead><tr><th>Asal</th><th>Tujuan</th><th>Durasi</th><th>Jumlah Jadwal</th></tr></thead>
          <tbody>
            {routes.map((r) => (
              <tr key={r.id}>
                <td>{r.origin}</td>
                <td>{r.destination}</td>
                <td>{durationLabel(r.durationMin)}</td>
                <td>{schedules.filter((s) => s.routeId === r.id).length}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
