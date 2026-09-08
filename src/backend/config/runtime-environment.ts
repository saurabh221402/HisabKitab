import "server-only";

export type RuntimeEnvironment = Readonly<{
  supabaseConfigured: boolean;
}>;

export function readRuntimeEnvironment(): RuntimeEnvironment {
  return {
    supabaseConfigured: Boolean(
      process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() &&
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim(),
    ),
  };
}

export type SupabasePublicEnvironment = Readonly<{
  publishableKey: string;
  url: string;
}>;

export function requireSupabasePublicEnvironment(): SupabasePublicEnvironment {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();

  if (!url || !publishableKey) {
    throw new Error("Supabase public environment is not configured.");
  }

  return { publishableKey, url };
}
