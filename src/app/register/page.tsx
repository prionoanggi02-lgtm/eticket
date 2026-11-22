import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { RegisterForm } from "./RegisterForm";

type Props = { searchParams: Promise<{ next?: string }> };

export default async function RegisterPage({ searchParams }: Props) {
  const { next } = await searchParams;
  if (await getSession()) redirect(next ?? "/");

  return (
    <div className="card mx-auto max-w-md space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Daftar Akun</h1>
        <p className="text-sm text-slate-500">Buat akun customer untuk mulai memesan tiket.</p>
      </div>
      <RegisterForm next={next} />
      <p className="text-center text-sm text-slate-500">
        Sudah punya akun? <Link href="/login" className="font-semibold text-sky-700">Masuk</Link>
      </p>
    </div>
  );
}
