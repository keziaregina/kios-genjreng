import { NextResponse } from "next/server";

import { apiError, badRequest, notFound, parseId, publicUserSelect } from "@/lib/api";
import { prisma } from "@/lib/prisma";

/** Next 15: route context `params` is a Promise and must be awaited. */
type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteContext) {
  try {
    const id = parseId((await params).id);
    if (id === null) return badRequest("id must be a positive integer");

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

    const user = await prisma.user.delete({
      where: { id },
      select: publicUserSelect,
    });

    return NextResponse.json(user);
  } catch (error) {
    return apiError("DELETE /api/users/[id]", error);
  }
}
