"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { Prisma } from "@/lib/generated/prisma/client";
import { EMAIL_PATTERN, MIN_PASSWORD_LENGTH } from "@/lib/account";
import { safeNextPath } from "@/lib/auth/next-path";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import {
  checkLoginAttempts,
  clearLoginFailures,
  recordLoginFailure,
} from "@/lib/auth/rate-limit";
import { clearSessionCookie, setSessionCookie } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import type { ActionResult } from "@/types/action";
import { Role } from "@/types/user";

export type RegisterInput = {
  name: string;
  email: string;
  password: string;
  role: string;
};

export type LoginInput = {
  email: string;
  password: string;
  next?: string;
};

// The submitted role is untrusted input, so only the two enum members are accepted.
function parseRole(raw: string): Role | null {
  return raw === Role.BUYER || raw === Role.MERCHANT ? raw : null;
}

// Failures are counted per client address and email so one attacker cannot lock out everyone.
async function rateLimitKey(email: string): Promise<string> {
  const store = await headers();
  const forwarded = store.get("x-forwarded-for")?.split(",")[0]?.trim();
  return `${forwarded || "local"}:${email}`;
}

export async function register(input: RegisterInput): Promise<ActionResult> {
  const name = input.name?.trim();
  const email = input.email?.trim().toLowerCase();
  const password = input.password ?? "";
  const role = parseRole(input.role);

  if (!name) return { ok: false, message: "Nama wajib diisi" };
  if (!email || !EMAIL_PATTERN.test(email)) {
    return { ok: false, message: "Format email tidak valid" };
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    return { ok: false, message: `Password minimal ${MIN_PASSWORD_LENGTH} karakter` };
  }
  if (!role) return { ok: false, message: "Pilih dulu mau beli atau jualan" };

  let created: { id: number; tokenVersion: number };

  try {
    created = await prisma.user.create({
      data: { name, email, password: await hashPassword(password), role },
      select: { id: true, tokenVersion: true },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { ok: false, message: "Email sudah terdaftar" };
    }
    console.error("[register]", error);
    return { ok: false, message: "Gagal mendaftar" };
  }

  await setSessionCookie({
    userId: created.id,
    role,
    tokenVersion: created.tokenVersion,
  });
  redirect("/dashboard");
}

export async function login(input: LoginInput): Promise<ActionResult> {
  const email = input.email?.trim().toLowerCase();
  const password = input.password ?? "";

  if (!email || !password) {
    return { ok: false, message: "Email dan password wajib diisi" };
  }

  const key = await rateLimitKey(email);
  const rate = checkLoginAttempts(key);

  if (!rate.allowed) {
    return {
      ok: false,
      message: `Terlalu banyak percobaan gagal. Coba lagi dalam ${rate.retryAfterMinutes} menit`,
    };
  }

  // One message for both branches so the form never reveals which emails exist.
  const invalid = { ok: false, message: "Email atau password salah" } as const;

  let user: {
    id: number;
    password: string;
    role: Role;
    tokenVersion: number;
  } | null;

  try {
    user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, password: true, role: true, tokenVersion: true },
    });
  } catch (error) {
    console.error("[login]", error);
    return { ok: false, message: "Gagal masuk" };
  }

  if (!user || !(await verifyPassword(user.password, password))) {
    recordLoginFailure(key);
    return invalid;
  }

  clearLoginFailures(key);
  await setSessionCookie({
    userId: user.id,
    role: user.role,
    tokenVersion: user.tokenVersion,
  });
  redirect(safeNextPath(input.next));
}

export async function logout(): Promise<void> {
  await clearSessionCookie();
  redirect("/");
}
