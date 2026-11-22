import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { LoginForm } from "./LoginForm";

type Props = { searchParams: Promise<{ next?: string }> };

export default async function LoginPage({ searchParams }: Props) {
  const { next } = await searchParams;
  if (await getSession()) redirect(next ?? "/");

  return (
    <div className="mx-auto max-w-md space-y-4">
      <div className="card space-y-4">
        <div>
          <h1 className="text-2xl font-bold">Masuk</h1>
          <p className="text-sm text-slate-500">Masuk untuk memesan dan melihat tiket Anda.</p>
        </div>
        <LoginForm next={next} />
        <p className="text-center text-sm text-slate-500">
          Belum punya akun?{" "}
          <Link href={`/register${next ? `?next=${encodeURIComponent(next)}` : ""}`} className="font-semibold text-sky-700">Daftar</Link>
        </p>
      </div>
      <div className="card text-sm">
        <p className="mb-2 font-semibold">Akun demo (password: <code>password123</code>)</p>
        <ul className="space-y-1 text-slate-600">
          <li>👑 Admin: <code>admin@eticket.id</code></li>
          <li>🧳 Agen: <code>agen@eticket.id</code></li>
          <li>🙋 Customer: <code>budi@mail.com</code></li>
        </ul>
      </div>
    </div>
  );
}
