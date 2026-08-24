import { redirect } from "next/navigation";

import { publicUserSelect } from "@/lib/api";
import { readSessionCookie, type SessionPayload } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { Role, type PublicUser } from "@/types/user";

// The cookie only proves the token was signed; the row decides whether it still counts.
async function loadSessionUser() {
  const session = await readSessionCookie();
  if (!session) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { ...publicUserSelect, tokenVersion: true },
  });

  if (!user || user.tokenVersion !== session.tokenVersion) return null;

  return user;
}

export async function getSession(): Promise<SessionPayload | null> {
  const user = await loadSessionUser();
  if (!user) return null;

  return { userId: user.id, role: user.role, tokenVersion: user.tokenVersion };
}

export async function getCurrentUser(): Promise<PublicUser | null> {
  const user = await loadSessionUser();
  if (!user) return null;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    storeName: user.storeName,
    city: user.city,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export async function requireUser(): Promise<SessionPayload> {
  const session = await getSession();
  // Route the rejection through the handler that deletes the cookie, otherwise a revoked one loops on /auth/login.
  if (!session) redirect("/auth/session-expired");
  return session;
}

export async function requireMerchant(): Promise<SessionPayload> {
  const session = await requireUser();
  if (session.role !== Role.MERCHANT) redirect("/dashboard");
  return session;
}
