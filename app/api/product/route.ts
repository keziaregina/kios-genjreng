import { NextResponse } from "next/server";

import { apiError, badRequest } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { getProducts } from "@/lib/queries";

export async function GET() {
  try {
    return NextResponse.json(await getProducts());
  } catch (error) {
    return apiError("GET /api/product", error);
  }
}

export async function POST(request: Request) {
  try {
    const { name, price, categoryId, userId } = await request.json();

    if (!name || price === undefined || !categoryId || !userId) {
      return badRequest("name, price, categoryId, and userId are required");
    }

    if (!Number.isInteger(price) || price < 0) {
      return badRequest("price must be a non-negative integer");
    }

    const product = await prisma.product.create({
      data: {
        name,
        price,
        categoryId: Number(categoryId),
        userId: Number(userId),
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    return apiError("POST /api/product", error);
  }
}
