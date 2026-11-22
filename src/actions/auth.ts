"use server";

import { redirect } from "next/navigation";
import { read, transaction, write } from "@/lib/db";
import { genId } from "@/lib/data";
import { hashPassword, verifyPassword } from "@/lib/password";
import { createSession, destroySession } from "@/lib/session";
import type { FormState, User } from "@/lib/types";
import { loginSchema, registerSchema } from "@/lib/validations";

function safeNext(value: FormDataEntryValue | null, fallback: string) {
  const next = String(value ?? "");
  return next.startsWith("/") && !next.startsWith("//") ? next : fallback;
}

export async function login(_: FormState, formData: FormData): Promise<FormState> {
  const values = { email: String(formData.get("email") ?? "") };
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message, values };

  const users = await read("users");
  const user = users.find((u) => u.email.toLowerCase() === parsed.data.email.toLowerCase());
  if (!user || !verifyPassword(parsed.data.password, user.password)) {
    return { error: "Email atau password salah", values };
  }

  await createSession({ userId: user.id, name: user.name, role: user.role });
  redirect(safeNext(formData.get("next"), user.role === "CUSTOMER" ? "/" : "/dashboard"));
}

export async function register(_: FormState, formData: FormData): Promise<FormState> {
  const values = {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    phone: String(formData.get("phone") ?? ""),
  };
  const parsed = registerSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message, values };

  const result = await transaction(async () => {
    const users = await read("users");
    if (users.some((u) => u.email.toLowerCase() === parsed.data.email.toLowerCase())) {
      return { error: "Email sudah terdaftar" } as const;
    }
    const user: User = {
      id: genId("u"),
      name: parsed.data.name,
      email: parsed.data.email.toLowerCase(),
      password: hashPassword(parsed.data.password),
      phone: parsed.data.phone,
      role: "CUSTOMER",
      commissionRate: 0,
      createdAt: new Date().toISOString(),
    };
    users.push(user);
    await write("users", users);
    return { user } as const;
  });

  if ("error" in result) return { error: result.error, values };
  await createSession({ userId: result.user.id, name: result.user.name, role: result.user.role });
  redirect(safeNext(formData.get("next"), "/"));
}

export async function logout() {
  await destroySession();
  redirect("/");
}
