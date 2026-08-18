"use server";

import { redirect } from "next/navigation";

import { Prisma } from "@/lib/generated/prisma/client";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
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
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// The submitted role is untrusted input, so only the two enum members are accepted.
function parseRole(raw: string): Role | null {
  return raw === Role.BUYER || raw === Role.MERCHANT ? raw : null;
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
  if (password.length < 8) {
    return { ok: false, message: "Password minimal 8 karakter" };
  }
  if (!role) return { ok: false, message: "Pilih dulu mau beli atau jualan" };

  let userId: number;

  try {
    const user = await prisma.user.create({
      data: { name, email, password: await hashPassword(password), role },
      select: { id: true },
    });
    userId = user.id;
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

  await setSessionCookie({ userId, role });
  redirect("/dashboard");
}

export async function login(input: LoginInput): Promise<ActionResult> {
  const email = input.email?.trim().toLowerCase();
  const password = input.password ?? "";

  if (!email || !password) {
    return { ok: false, message: "Email dan password wajib diisi" };
  }

  // One message for both branches so the form never reveals which emails exist.
  const invalid = { ok: false, message: "Email atau password salah" } as const;

  let user: { id: number; password: string; role: Role } | null;

  try {
    user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, password: true, role: true },
    });
  } catch (error) {
    console.error("[login]", error);
    return { ok: false, message: "Gagal masuk" };
  }

  if (!user) return invalid;
  if (!(await verifyPassword(user.password, password))) return invalid;

  await setSessionCookie({ userId: user.id, role: user.role });
  redirect("/dashboard");
}

export async function logout(): Promise<void> {
  await clearSessionCookie();
  redirect("/");
}
