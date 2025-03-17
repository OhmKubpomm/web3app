import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Get the player address from cookies
  const playerAddress = request.cookies.get("player_address")?.value

  // If accessing dashboard without player address, redirect to home
  if (request.nextUrl.pathname.startsWith("/dashboard") && !playerAddress) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*"],
}

