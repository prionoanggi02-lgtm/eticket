import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Booking, Role } from "./types";

const COOKIE = "session";
const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET ?? "dev-secret-ganti-di-.env.local-minimal-32-karakter!!",
);

export type Session = { userId: string; name: string; role: Role };

export async function createSession(session: Session) {
  const token = await new SignJWT({ ...session })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function getSession(): Promise<Session | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return { userId: String(payload.userId), name: String(payload.name), role: payload.role as Role };
  } catch {
    return null;
  }
}

export async function destroySession() {
  (await cookies()).delete(COOKIE);
}

/** Wajib login (dan opsional role tertentu). Dipakai di page & server action. */
export async function requireSession(opts: { roles?: Role[]; next?: string } = {}): Promise<Session> {
  const session = await getSession();
  if (!session) redirect(`/login${opts.next ? `?next=${encodeURIComponent(opts.next)}` : ""}`);
  if (opts.roles && !opts.roles.includes(session.role)) redirect("/");
  return session;
}

export function canAccessBooking(session: Session, booking: Booking) {
  return session.role === "ADMIN" || booking.userId === session.userId;
}
