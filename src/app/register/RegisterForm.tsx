"use client";

import { useActionState } from "react";
import { register } from "@/actions/auth";
import { SubmitButton } from "@/components/ui";

export function RegisterForm({ next }: { next?: string }) {
  const [state, action] = useActionState(register, undefined);
  const v = state?.values ?? {};
  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="next" value={next ?? ""} />
      <div>
        <label className="label" htmlFor="name">Nama Lengkap</label>
        <input id="name" name="name" className="input" defaultValue={v.name} required />
      </div>
      <div>
        <label className="label" htmlFor="email">Email</label>
        <input id="email" name="email" type="email" className="input" defaultValue={v.email} required />
      </div>
      <div>
        <label className="label" htmlFor="phone">No. HP</label>
        <input id="phone" name="phone" className="input" placeholder="081234567890" defaultValue={v.phone} required />
      </div>
      <div>
        <label className="label" htmlFor="password">Password</label>
        <input id="password" name="password" type="password" minLength={6} className="input" required />
      </div>
      {state?.error && <p className="alert-error">{state.error}</p>}
      <SubmitButton className="btn w-full">Daftar</SubmitButton>
    </form>
  );
}
