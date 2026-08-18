import { NextResponse, type NextRequest } from "next/server";

import { SESSION_COOKIE, decodeSession } from "@/lib/auth/session";
import { Role } from "@/types/user";

const AUTH_PATHS = ["/auth/login", "/auth/register"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await decodeSession(
    request.cookies.get(SESSION_COOKIE)?.value,
  );

  if (AUTH_PATHS.includes(pathname)) {
    if (session) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  if (!session) {
    const login = new URL("/auth/login", request.url);
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }

  // Middleware is the first guard only — merchant pages still call requireMerchant().
  if (pathname.startsWith("/dashboard/store") && session.role !== Role.MERCHANT) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/product/:path*", "/auth/login", "/auth/register"],
};
