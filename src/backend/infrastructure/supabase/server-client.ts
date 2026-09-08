import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { requireSupabasePublicEnvironment } from "@/backend/config/runtime-environment";

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  const environment = requireSupabasePublicEnvironment();

  return createServerClient(environment.url, environment.publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, options, value }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components cannot write cookies. The proxy owns refreshes.
        }
      },
    },
  });
}
