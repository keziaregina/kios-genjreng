import { NextResponse } from "next/server";

import { apiError, badRequest, notFound, parseId } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { getProduct } from "@/lib/queries";

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

    const product = await prisma.product.delete({ where: { id } });

    return NextResponse.json(product);
  } catch (error) {
    return apiError("DELETE /api/product/[id]", error);
  }
}
