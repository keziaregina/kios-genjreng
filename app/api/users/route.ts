import { NextResponse } from "next/server";

import { apiError, badRequest, publicUserSelect } from "@/lib/api";
import { prisma } from "@/lib/prisma";

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
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return badRequest("name, email, and password are required");
    }

    // SECURITY TODO: password is persisted in plain text. Hash it (argon2/bcrypt)
    // before this endpoint is exposed to anything but local development.
    const user = await prisma.user.create({
      data: { name, email, password },
      select: publicUserSelect,
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    return apiError("POST /api/users", error);
  }
}
