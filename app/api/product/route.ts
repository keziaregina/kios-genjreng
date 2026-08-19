import { NextResponse } from "next/server";

import { apiError, badRequest, forbidden, unauthorized } from "@/lib/api";
import { getSession } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { getProducts } from "@/lib/queries";
import { Role } from "@/types/user";

export async function GET() {
  try {
    return NextResponse.json(await getProducts());
  } catch (error) {
    return apiError("GET /api/product", error);
  }
}

export async function POST(request: Request) {
  try {
    // External consumers sit outside the middleware matcher, so this route checks the session itself.
    const session = await getSession();

    if (!session) return unauthorized();
    if (session.role !== Role.MERCHANT) return forbidden();

    const { name, price, categoryId } = await request.json();

    if (!name || price === undefined || !categoryId) {
      return badRequest("name, price, and categoryId are required");
    }

    if (!Number.isInteger(price) || price < 0) {
      return badRequest("price must be a non-negative integer");
    }

    const product = await prisma.product.create({
      data: {
        name,
        price,
        categoryId: Number(categoryId),
        userId: session.userId,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    return apiError("POST /api/product", error);
  }
}
