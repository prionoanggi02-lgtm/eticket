import Link from "next/link";
import { SearchForm } from "@/components/SearchForm";
import { expireStaleBookings, isFuture, listCities, listScheduleDetails } from "@/lib/data";
import { durationLabel, fmtDate, fmtTime, rupiah, transportLabel, ymdJakarta } from "@/lib/format";
import { searchSchema } from "@/lib/validations";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function SearchPage({ searchParams }: Props) {
  const sp = await searchParams;
  const parsed = searchSchema.safeParse(sp);
  await expireStaleBookings();
  const cities = await listCities();

  if (!parsed.success) {
    return (
      <div className="space-y-4">
        <div className="card"><SearchForm cities={cities} /></div>
        <p className="alert-error">{parsed.error.issues[0].message === "Kota asal dan tujuan tidak boleh sama" ? parsed.error.issues[0].message : "Parameter pencarian tidak valid."}</p>
      </div>
    );
  }

  const { origin, destination, date, pax } = parsed.data;
  const results = (await listScheduleDetails())
    .filter(
      (s) =>
        s.route.origin === origin &&
        s.route.destination === destination &&
        ymdJakarta(s.departureAt) === date &&
        isFuture(s.departureAt),
    )
    .sort((a, b) => a.departureAt.localeCompare(b.departureAt));

  return (
    <div className="space-y-6">
      <div className="card"><SearchForm cities={cities} defaults={parsed.data} /></div>

      <div>
        <h1 className="text-xl font-bold">{origin} → {destination}</h1>
        <p className="text-sm text-slate-500">{fmtDate(`${date}T12:00:00+07:00`)} • {pax} penumpang • {results.length} jadwal</p>
      </div>

      {results.length === 0 && (
        <div className="card text-center text-slate-500">Tidak ada jadwal tersedia untuk tanggal ini. Coba tanggal lain.</div>
      )}

      <div className="space-y-3">
        {results.map((s) => {
          const left = s.totalSeats - s.bookedSeats;
          const enough = left >= pax;
          return (
            <div key={s.id} className="card flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="min-w-48">
                <p className="font-semibold">{s.operator.name}</p>
                <p className="text-xs text-slate-500">{transportLabel[s.operator.type]} • {s.operator.code}</p>
              </div>
              <div className="flex flex-1 items-center gap-4">
                <div className="text-center">
                  <p className="text-xl font-bold">{fmtTime(s.departureAt)}</p>
                  <p className="text-xs text-slate-500">{s.route.origin}</p>
                </div>
                <div className="flex-1 text-center text-xs text-slate-500">
                  {durationLabel(s.route.durationMin)}
                  <div className="my-1 border-t border-dashed border-slate-300" />
                  Langsung
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold">{fmtTime(s.arrivalAt)}</p>
                  <p className="text-xs text-slate-500">{s.route.destination}</p>
                </div>
              </div>
              <div className="text-right md:min-w-48">
                <p className="text-lg font-bold text-sky-700">{rupiah(s.price)}<span className="text-xs font-normal text-slate-500"> /org</span></p>
                <p className={`text-xs ${left < 10 ? "text-rose-600" : "text-slate-500"}`}>Sisa {left} kursi</p>
                {enough ? (
                  <Link href={`/booking/${s.id}?pax=${pax}`} className="btn mt-2">Pilih</Link>
                ) : (
                  <button className="btn mt-2" disabled>Kursi tidak cukup</button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
