import { tomorrowYmd, ymdJakarta } from "@/lib/format";

type Props = {
  cities: string[];
  defaults?: { origin?: string; destination?: string; date?: string; pax?: number };
};

/** Form GET biasa → /search?origin=..&destination=..&date=..&pax=.. */
export function SearchForm({ cities, defaults = {} }: Props) {
  return (
    <form action="/search" className="grid items-end gap-3 md:grid-cols-[1fr_1fr_1fr_110px_auto]">
      <div>
        <label className="label" htmlFor="origin">Dari</label>
        <select id="origin" name="origin" className="input" defaultValue={defaults.origin ?? "Jakarta"} required>
          {cities.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>
      <div>
        <label className="label" htmlFor="destination">Ke</label>
        <select id="destination" name="destination" className="input" defaultValue={defaults.destination ?? "Denpasar"} required>
          {cities.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>
      <div>
        <label className="label" htmlFor="date">Tanggal Berangkat</label>
        <input id="date" type="date" name="date" className="input" min={ymdJakarta(new Date())} defaultValue={defaults.date ?? tomorrowYmd()} required />
      </div>
      <div>
        <label className="label" htmlFor="pax">Penumpang</label>
        <input id="pax" type="number" name="pax" min={1} max={9} className="input" defaultValue={defaults.pax ?? 1} required />
      </div>
      <button className="btn h-[38px]">🔍 Cari</button>
    </form>
  );
}
