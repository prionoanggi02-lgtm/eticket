"use client";

import { useActionState } from "react";
import { login } from "@/actions/auth";
import { SubmitButton } from "@/components/ui";

export function LoginForm({ next }: { next?: string }) {
  const [state, action] = useActionState(login, undefined);
  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="next" value={next ?? ""} />
      <div>
        <label className="label" htmlFor="email">Email</label>
        <input id="email" name="email" type="email" className="input" defaultValue={state?.values?.email} required />
      </div>
      <div>
        <label className="label" htmlFor="password">Password</label>
        <input id="password" name="password" type="password" className="input" required />
      </div>
      {state?.error && <p className="alert-error">{state.error}</p>}
      <SubmitButton className="btn w-full">Masuk</SubmitButton>
    </form>
  );
}
