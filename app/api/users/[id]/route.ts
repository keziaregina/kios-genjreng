import { NextResponse } from "next/server";

import {
  apiError,
  badRequest,
  forbidden,
  notFound,
  parseId,
  publicUserSelect,
  unauthorized,
} from "@/lib/api";
import { getSession } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";

/** Next 15: route context `params` is a Promise and must be awaited. */
type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteContext) {
  try {
    const id = parseId((await params).id);
    if (id === null) return badRequest("id must be a positive integer");

    // Names and emails are only for signed-in visitors, not for anonymous scrapers.
    if (!(await getSession())) return unauthorized();

    const user = await prisma.user.findUnique({
      where: { id },
      select: publicUserSelect,
    });

    if (!user) return notFound("User not found");

    return NextResponse.json(user);
  } catch (error) {
    return apiError("GET /api/users/[id]", error);
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  try {
    const id = parseId((await params).id);
    if (id === null) return badRequest("id must be a positive integer");

    // There is no admin role yet, so an account may only be deleted by its owner.
    const session = await getSession();
    if (!session) return unauthorized();
    if (session.userId !== id) return forbidden();

    const user = await prisma.user.delete({
      where: { id },
      select: publicUserSelect,
    });

    return NextResponse.json(user);
  } catch (error) {
    return apiError("DELETE /api/users/[id]", error);
  }
}
