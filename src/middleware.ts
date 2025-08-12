import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  // Simple middleware that just passes through
  // Authentication will be handled at component level
  return NextResponse.next();
}

export const config = {
  // Apply to minimal routes to avoid conflicts
  matcher: [
    // Only apply to protected routes when we add them later
    "/dashboard/:path*",
    "/profile/:path*",
  ],
};
