import { NextResponse } from "next/server";

import { apiError, badRequest, publicUserSelect } from "@/lib/api";
import { hashPassword } from "@/lib/auth/password";
import { prisma } from "@/lib/prisma";
import { Role } from "@/types/user";

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: publicUserSelect,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(users);
  } catch (error) {
    return apiError("GET /api/users", error);
  }
}

export async function POST(request: Request) {
  try {
    const { name, email, password, role } = await request.json();

    if (!name || !email || !password) {
      return badRequest("name, email, and password are required");
    }

    if (role !== undefined && role !== Role.BUYER && role !== Role.MERCHANT) {
      return badRequest("role must be BUYER or MERCHANT");
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: await hashPassword(password),
        role: role ?? Role.BUYER,
      },
      select: publicUserSelect,
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    return apiError("POST /api/users", error);
  }
}
