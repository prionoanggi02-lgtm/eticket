"use client";

import { useActionState } from "react";
import { createBooking } from "@/actions/booking";
import { SubmitButton } from "@/components/ui";
import { rupiah } from "@/lib/format";

type Props = {
  scheduleId: string;
  pax: number;
  price: number;
  defaultContact: Partial<Record<"contactName" | "contactEmail" | "contactPhone", string>>;
};

export function BookingForm({ scheduleId, pax, price, defaultContact }: Props) {
  const [state, action] = useActionState(createBooking, undefined);
  const v: Record<string, string | undefined> = state?.values ?? defaultContact;

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="scheduleId" value={scheduleId} />
      <input type="hidden" name="pax" value={pax} />

      <section className="card space-y-3">
        <h2 className="font-semibold">Data Pemesan</h2>
        <div className="grid gap-3 md:grid-cols-3">
          <div>
            <label className="label" htmlFor="contactName">Nama</label>
            <input id="contactName" name="contactName" className="input" defaultValue={v.contactName} required />
          </div>
          <div>
            <label className="label" htmlFor="contactEmail">Email</label>
            <input id="contactEmail" name="contactEmail" type="email" className="input" defaultValue={v.contactEmail} required />
          </div>
          <div>
            <label className="label" htmlFor="contactPhone">No. HP</label>
            <input id="contactPhone" name="contactPhone" className="input" placeholder="0812..." defaultValue={v.contactPhone} required />
          </div>
        </div>
      </section>

      {Array.from({ length: pax }, (_, i) => (
        <section key={i} className="card space-y-3">
          <h2 className="font-semibold">Penumpang {i + 1}</h2>
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="label" htmlFor={`p${i}_name`}>Nama Lengkap (sesuai identitas)</label>
              <input id={`p${i}_name`} name={`p${i}_name`} className="input" defaultValue={v[`p${i}_name`]} required />
            </div>
            <div>
              <label className="label" htmlFor={`p${i}_id`}>NIK / No. Paspor</label>
              <input id={`p${i}_id`} name={`p${i}_id`} className="input" defaultValue={v[`p${i}_id`]} required />
            </div>
          </div>
        </section>
      ))}

      {state?.error && <p className="alert-error">{state.error}</p>}

      <div className="card flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">Total pembayaran</p>
          <p className="text-xl font-bold text-sky-700">{rupiah(price * pax)}</p>
        </div>
        <SubmitButton>Lanjut ke Pembayaran →</SubmitButton>
      </div>
    </form>
  );
}
