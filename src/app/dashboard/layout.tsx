import Link from "next/link";
import { requireSession } from "@/lib/session";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession({ roles: ["ADMIN", "AGENT"], next: "/dashboard" });
  const links = [
    { href: "/dashboard", label: "📊 Ringkasan" },
    { href: "/dashboard/bookings", label: "🧾 Booking" },
    ...(session.role === "ADMIN"
      ? [
          { href: "/dashboard/schedules", label: "🗓️ Jadwal" },
          { href: "/dashboard/routes", label: "🧭 Rute" },
        ]
      : []),
    { href: "/dashboard/check-in", label: "✅ Check-in" },
    { href: "/", label: "➕ Pesan Tiket" },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-[200px_1fr]">
      <aside className="no-print h-fit space-y-1 md:sticky md:top-20">
        <p className="px-3 pb-2 text-xs font-semibold tracking-wide text-slate-400 uppercase">
          {session.role === "ADMIN" ? "Panel Admin" : "Panel Agen"}
        </p>
        {links.map((l) => (
          <Link key={l.href} href={l.href} className="block rounded-lg px-3 py-2 text-sm hover:bg-white hover:shadow-sm">
            {l.label}
          </Link>
        ))}
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
