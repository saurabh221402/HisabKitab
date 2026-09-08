import type { NextRequest } from "next/server";

import { updateSupabaseSession } from "@/backend/infrastructure/supabase/update-session";

export function proxy(request: NextRequest) {
  return updateSupabaseSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
