import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

// Only /admin needs a session check (auth guard + redirect). Public wedding pages
// (/c/[slug] and everything under it) are almost entirely unauthenticated guests -
// running a Supabase auth.getUser() network round-trip in front of every one of
// those page loads was pure added latency for the visitors who benefit from it least.
export const config = {
  matcher: ["/admin/:path*"],
};
