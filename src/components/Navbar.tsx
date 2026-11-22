import Link from "next/link";
import { logout } from "@/actions/auth";
import { getSession } from "@/lib/session";

export async function Navbar() {
  const session = await getSession();
  const isStaff = session?.role === "ADMIN" || session?.role === "AGENT";

  return (
    <header className="no-print sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="text-lg font-bold text-sky-700">
          🎫 Nusa<span className="text-slate-900">eTicket</span>
        </Link>
        <div className="flex items-center gap-1 text-sm sm:gap-3">
          <Link href="/" className="rounded-lg px-3 py-2 hover:bg-slate-100">Cari Tiket</Link>
          {session && (
            <Link href="/my-bookings" className="rounded-lg px-3 py-2 hover:bg-slate-100">Pesanan Saya</Link>
          )}
          {isStaff && (
            <Link href="/dashboard" className="rounded-lg px-3 py-2 hover:bg-slate-100">Dashboard</Link>
          )}
          {session ? (
            <form action={logout} className="flex items-center gap-2">
              <span className="hidden text-slate-500 md:inline">
                {session.name} <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">{session.role}</span>
              </span>
              <button className="btn-outline">Keluar</button>
            </form>
          ) : (
            <Link href="/login" className="btn">Masuk</Link>
          )}
        </div>
      </nav>
    </header>
  );
}
