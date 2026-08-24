"use server";

import { EMAIL_PATTERN, MAX_NAME_LENGTH, MIN_PASSWORD_LENGTH } from "@/lib/account";
import { requireUser } from "@/lib/auth/guards";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { setSessionCookie } from "@/lib/auth/session";
import { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { createRateLimiter } from "@/lib/rate-limit";
import { revalidateAccount } from "@/lib/revalidate";
import type { ActionResult } from "@/types/action";
import type { AccountInput, PasswordInput } from "@/types/account";

// One bucket covers both writes so a stuck save button and a password guesser run out of tries alike.
const accountLimiter = createRateLimiter({ limit: 10, windowMs: 60_000 });

const LIMIT_MESSAGE = "Terlalu banyak perubahan akun, coba lagi sebentar lagi.";

export async function updateAccount(input: AccountInput): Promise<ActionResult> {
  const session = await requireUser();

  const name = String(input.name ?? "").trim();
  const email = String(input.email ?? "")
    .trim()
    .toLowerCase();

  if (!name) return { ok: false, message: "Nama wajib diisi" };
  if (name.length > MAX_NAME_LENGTH) {
    return { ok: false, message: `Nama maksimal ${MAX_NAME_LENGTH} karakter` };
  }
  if (!EMAIL_PATTERN.test(email)) {
    return { ok: false, message: "Format email tidak valid" };
  }

  const key = `account:${session.userId}`;
  if (!accountLimiter.check(key).allowed) return { ok: false, message: LIMIT_MESSAGE };

  try {
    await prisma.user.update({ where: { id: session.userId }, data: { name, email } });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { ok: false, message: "Email sudah dipakai akun lain" };
    }
    console.error("[updateAccount]", error);
    return { ok: false, message: "Gagal menyimpan akun" };
  }

  accountLimiter.record(key);
  revalidateAccount();
  return { ok: true };
}

export async function changePassword(input: PasswordInput): Promise<ActionResult> {
  const session = await requireUser();

  const currentPassword = input.currentPassword ?? "";
  const newPassword = input.newPassword ?? "";

  if (!currentPassword) return { ok: false, message: "Password lama wajib diisi" };
  if (newPassword.length < MIN_PASSWORD_LENGTH) {
    return { ok: false, message: `Password baru minimal ${MIN_PASSWORD_LENGTH} karakter` };
  }
  if (newPassword !== input.confirmPassword) {
    return { ok: false, message: "Konfirmasi password tidak sama" };
  }
  if (newPassword === currentPassword) {
    return { ok: false, message: "Password baru harus berbeda dari yang lama" };
  }

  const key = `account:${session.userId}`;
  if (!accountLimiter.check(key).allowed) return { ok: false, message: LIMIT_MESSAGE };

  // A wrong guess is recorded before the check runs, so a failed attempt still costs a try.
  accountLimiter.record(key);

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { password: true },
  });

  if (!user || !(await verifyPassword(user.password, currentPassword))) {
    return { ok: false, message: "Password lama salah" };
  }

  let updated: { tokenVersion: number };

  try {
    updated = await prisma.user.update({
      where: { id: session.userId },
      // A new password revokes every cookie already handed out, so other devices have to sign in again.
      data: {
        password: await hashPassword(newPassword),
        tokenVersion: { increment: 1 },
      },
      select: { tokenVersion: true },
    });
  } catch (error) {
    console.error("[changePassword]", error);
    return { ok: false, message: "Gagal mengganti password" };
  }

  // The bump would sign this device out too, so the cookie is re-issued with the version just written.
  await setSessionCookie({
    userId: session.userId,
    role: session.role,
    tokenVersion: updated.tokenVersion,
  });

  return { ok: true };
}
