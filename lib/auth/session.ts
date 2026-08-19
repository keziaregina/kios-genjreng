import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

import { Role } from "@/types/user";

export const SESSION_COOKIE = "session";

export type SessionPayload = {
  userId: number;
  role: Role;
  tokenVersion: number;
};

const MAX_AGE = 60 * 60 * 24 * 7;

// Fail loudly instead of signing sessions with a guessable fallback secret.
function secret(): Uint8Array {
  const raw = process.env.SESSION_SECRET;
  if (!raw || raw.length < 32) {
    throw new Error("SESSION_SECRET is missing or shorter than 32 characters");
  }
  return new TextEncoder().encode(raw);
}

export async function encodeSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({
    userId: payload.userId,
    role: payload.role,
    tokenVersion: payload.tokenVersion,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret());
}

// A tampered or expired token is an anonymous visitor, not a crash.
export async function decodeSession(
  token: string | undefined,
): Promise<SessionPayload | null> {
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, secret());
    const userId = payload.userId;
    const role = payload.role;
    const tokenVersion = payload.tokenVersion;

    if (typeof userId !== "number" || !Number.isInteger(userId) || userId <= 0) {
      return null;
    }
    if (role !== Role.BUYER && role !== Role.MERCHANT) return null;
    if (
      typeof tokenVersion !== "number" ||
      !Number.isInteger(tokenVersion) ||
      tokenVersion < 0
    ) {
      return null;
    }

    return { userId, role, tokenVersion };
  } catch {
    return null;
  }
}

export async function setSessionCookie(payload: SessionPayload): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, await encodeSession(payload), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function readSessionCookie(): Promise<SessionPayload | null> {
  const store = await cookies();
  return decodeSession(store.get(SESSION_COOKIE)?.value);
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}
