import { redirect } from "next/navigation";

import { publicUserSelect } from "@/lib/api";
import { readSessionCookie, type SessionPayload } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { Role, type PublicUser } from "@/types/user";

export function getSession(): Promise<SessionPayload | null> {
  return readSessionCookie();
}

export async function getCurrentUser(): Promise<PublicUser | null> {
  const session = await getSession();
  if (!session) return null;

  return prisma.user.findUnique({
    where: { id: session.userId },
    select: publicUserSelect,
  });
}

export async function requireUser(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) redirect("/auth/login");
  return session;
}

export async function requireMerchant(): Promise<SessionPayload> {
  const session = await requireUser();
  if (session.role !== Role.MERCHANT) redirect("/dashboard");
  return session;
}
