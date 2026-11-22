"use client";

import { useActionState } from "react";
import { createRoute } from "@/actions/admin";
import { SubmitButton } from "@/components/ui";

export function RouteForm() {
  const [state, action] = useActionState(createRoute, undefined);
  return (
    <form action={action} className="card space-y-3">
      <h2 className="font-semibold">Tambah Rute</h2>
      <div className="grid gap-3 md:grid-cols-3">
        <div>
          <label className="label" htmlFor="origin">Kota Asal</label>
          <input id="origin" name="origin" className="input" required />
        </div>
        <div>
          <label className="label" htmlFor="destination">Kota Tujuan</label>
          <input id="destination" name="destination" className="input" required />
        </div>
        <div>
          <label className="label" htmlFor="durationMin">Durasi (menit)</label>
          <input id="durationMin" name="durationMin" type="number" min={10} className="input" required />
        </div>
      </div>
      {state?.error && <p className="alert-error">{state.error}</p>}
      {state?.success && <p className="alert-success">{state.success}</p>}
      <SubmitButton>Simpan Rute</SubmitButton>
    </form>
  );
}
