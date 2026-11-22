"use client";

import { useActionState } from "react";
import { checkIn } from "@/actions/checkin";
import { SubmitButton } from "@/components/ui";

export function CheckInForm() {
  const [state, action] = useActionState(checkIn, undefined);
  return (
    <div className="card space-y-4">
      <form action={action} className="flex flex-wrap items-end gap-3">
        <div className="flex-1">
          <label className="label" htmlFor="code">Kode Tiket (hasil scan QR / input manual)</label>
          <input id="code" name="code" className="input font-mono uppercase" placeholder="TKT-XXXXXXXX" autoFocus required />
        </div>
        <SubmitButton>Validasi</SubmitButton>
      </form>
      {state && (
        <div className={`rounded-xl border p-4 ${state.ok ? "border-emerald-300 bg-emerald-50" : "border-rose-300 bg-rose-50"}`}>
          <p className={`text-lg font-bold ${state.ok ? "text-emerald-700" : "text-rose-700"}`}>
            {state.ok ? "✅" : "⛔"} {state.message}
          </p>
          {state.passenger && (
            <div className="mt-1 text-sm text-slate-700">
              <p>Penumpang: <b>{state.passenger}</b> • Booking <span className="font-mono">{state.bookingCode}</span></p>
              <p>{state.route}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
