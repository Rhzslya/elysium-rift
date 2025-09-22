// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/game/")) {
    const roomIdInUrl = pathname.split("/game/")[1]?.split("/")[0];
    const hasAccess = req.cookies.get("hasGameAccess");

    if (!hasAccess || hasAccess.value !== roomIdInUrl) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return NextResponse.next();
}
