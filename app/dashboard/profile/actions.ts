"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireUser } from "@/lib/auth/guards";
import { setSessionCookie } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { Role } from "@/types/user";

export async function becomeMerchant(): Promise<void> {
  const session = await requireUser();

  if (session.role !== Role.MERCHANT) {
    await prisma.user.update({
      where: { id: session.userId },
      data: { role: Role.MERCHANT },
    });

    // The role lives inside the token, so it has to be re-issued or the nav stays stale for 7 days.
    await setSessionCookie({ userId: session.userId, role: Role.MERCHANT });
  }

  revalidatePath("/dashboard");
  redirect("/dashboard/store");
}
