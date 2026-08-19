import { NextResponse, type NextRequest } from "next/server";

import { safeNextPath } from "@/lib/auth/next-path";
import { SESSION_COOKIE } from "@/lib/auth/session";

// A revoked cookie still passes Edge middleware, so it is deleted here or /auth/login bounces back forever.
export async function GET(request: NextRequest) {
  const next = request.nextUrl.searchParams.get("next");
  const login = new URL("/auth/login", request.url);
  if (next) login.searchParams.set("next", safeNextPath(next));

  const response = NextResponse.redirect(login);
  response.cookies.delete(SESSION_COOKIE);
  return response;
}
