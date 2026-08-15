import { NextResponse } from "next/server";

import { Prisma } from "@/lib/generated/prisma/client";

/** Fields of `User` that may cross the network. `password` is never one of them. */
export const publicUserSelect = {
  id: true,
  name: true,
  email: true,
  createdAt: true,
  updatedAt: true,
} as const;

/** Parses a dynamic `[id]` segment into a positive integer, or `null` when invalid. */
export function parseId(raw: string): number | null {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export function badRequest(message: string) {
  return NextResponse.json({ message }, { status: 400 });
}

export function notFound(message: string) {
  return NextResponse.json({ message }, { status: 404 });
}

/** Maps Prisma failures onto HTTP so every route handler fails the same way. */
export function apiError(scope: string, error: unknown) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case "P2002":
        return NextResponse.json(
          { message: "Record already exists" },
          { status: 409 },
        );
      case "P2003":
        return badRequest("Related record does not exist");
      case "P2025":
        return notFound("Record not found");
    }
  }

  console.error(`[${scope}]`, error);
  return NextResponse.json({ message: "Internal server error" }, { status: 500 });
}
