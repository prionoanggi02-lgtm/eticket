"use client";

import { useActionState } from "react";
import { createSchedule } from "@/actions/admin";
import { SubmitButton } from "@/components/ui";
import type { Operator, Route } from "@/lib/types";

export function ScheduleForm({ routes, operators }: { routes: Route[]; operators: Operator[] }) {
  const [state, action] = useActionState(createSchedule, undefined);
  return (
    <form action={action} className="card space-y-3">
      <h2 className="font-semibold">Tambah Jadwal</h2>
      <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-6">
        <div className="lg:col-span-2">
          <label className="label" htmlFor="routeId">Rute</label>
          <select id="routeId" name="routeId" className="input" required>
            {routes.map((r) => <option key={r.id} value={r.id}>{r.origin} → {r.destination}</option>)}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="operatorId">Operator</label>
          <select id="operatorId" name="operatorId" className="input" required>
            {operators.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="departureAt">Berangkat (WIB)</label>
          <input id="departureAt" name="departureAt" type="datetime-local" className="input" required />
        </div>
        <div>
          <label className="label" htmlFor="price">Harga (Rp)</label>
          <input id="price" name="price" type="number" min={1000} step={1000} className="input" required />
        </div>
        <div>
          <label className="label" htmlFor="totalSeats">Kursi</label>
          <input id="totalSeats" name="totalSeats" type="number" min={1} className="input" required />
        </div>
      </div>
      {state?.error && <p className="alert-error">{state.error}</p>}
      {state?.success && <p className="alert-success">{state.success}</p>}
      <SubmitButton>Simpan Jadwal</SubmitButton>
    </form>
  );
}
