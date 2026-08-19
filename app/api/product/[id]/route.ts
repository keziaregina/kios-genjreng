import { NextResponse } from "next/server";

import {
  apiError,
  badRequest,
  forbidden,
  notFound,
  parseId,
  unauthorized,
} from "@/lib/api";
import { getSession } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { getProduct } from "@/lib/queries";
import { Role } from "@/types/user";

/** Next 15: route context `params` is a Promise and must be awaited. */
type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteContext) {
  try {
    const id = parseId((await params).id);
    if (id === null) return badRequest("id must be a positive integer");

    const product = await getProduct(id);
    if (!product) return notFound("Product not found");

    return NextResponse.json(product);
  } catch (error) {
    return apiError("GET /api/product/[id]", error);
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  try {
    const id = parseId((await params).id);
    if (id === null) return badRequest("id must be a positive integer");

    // Route handlers sit outside the middleware matcher, so ownership is checked here.
    const session = await getSession();
    if (!session) return unauthorized();
    if (session.role !== Role.MERCHANT) return forbidden();

    const product = await prisma.product.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!product) return notFound("Product not found");
    if (product.userId !== session.userId) return forbidden();

    return NextResponse.json(await prisma.product.delete({ where: { id } }));
  } catch (error) {
    return apiError("DELETE /api/product/[id]", error);
  }
}
