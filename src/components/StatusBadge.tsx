import { statusLabel } from "@/lib/format";
import type { BookingStatus } from "@/lib/types";

const styles: Record<BookingStatus, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  PAID: "bg-emerald-100 text-emerald-800",
  CANCELLED: "bg-slate-200 text-slate-700",
  EXPIRED: "bg-rose-100 text-rose-700",
};

export function StatusBadge({ status }: { status: BookingStatus }) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap ${styles[status]}`}>
      {statusLabel[status]}
    </span>
  );
}
