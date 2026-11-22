import Link from "next/link";
import { SearchForm } from "@/components/SearchForm";
import { read } from "@/lib/db";
import { listCities } from "@/lib/data";
import { durationLabel, tomorrowYmd } from "@/lib/format";

export default async function HomePage() {
  const [cities, routes] = await Promise.all([listCities(), read("routes")]);
  const date = tomorrowYmd();

  return (
    <div className="space-y-10">
      <section className="rounded-3xl bg-linear-to-br from-sky-600 to-indigo-700 p-6 text-white shadow-lg md:p-10">
        <h1 className="text-3xl font-bold md:text-4xl">Pesan tiket perjalanan dengan mudah</h1>
        <p className="mt-2 max-w-2xl text-sky-100">
          Pesawat, kereta, bus, dan kapal dalam satu aplikasi. Bayar, terima e-ticket ber-QR, dan check-in tanpa ribet.
        </p>
        <div className="mt-8 rounded-2xl bg-white p-5 text-slate-900 shadow">
          <SearchForm cities={cities} />
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-bold">Rute Populer</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {routes.map((r) => (
            <Link
              key={r.id}
              href={`/search?origin=${encodeURIComponent(r.origin)}&destination=${encodeURIComponent(r.destination)}&date=${date}&pax=1`}
              className="card transition hover:-translate-y-0.5 hover:border-sky-300"
            >
              <p className="text-lg font-semibold">{r.origin} → {r.destination}</p>
              <p className="text-sm text-slate-500">Durasi ± {durationLabel(r.durationMin)}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          ["🔎", "Cari & Bandingkan", "Lihat jadwal, harga, dan sisa kursi secara real-time."],
          ["💳", "Bayar Fleksibel", "Virtual Account, QRIS, dan e-wallet (simulasi)."],
          ["📱", "E-Ticket ber-QR", "Tunjukkan QR saat keberangkatan untuk check-in."],
        ].map(([icon, title, desc]) => (
          <div key={title} className="card">
            <p className="text-3xl">{icon}</p>
            <p className="mt-2 font-semibold">{title}</p>
            <p className="text-sm text-slate-500">{desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
