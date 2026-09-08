export type SystemHealth = Readonly<{
  checkedAt: string;
  databaseConfiguration: "configured" | "not-configured";
  service: "HisabKitab";
  status: "ok";
}>;

type SystemHealthInput = Readonly<{
  supabaseConfigured: boolean;
  now: Date;
}>;

export function getSystemHealth(input: SystemHealthInput): SystemHealth {
  return {
    checkedAt: input.now.toISOString(),
    databaseConfiguration: input.supabaseConfigured
      ? "configured"
      : "not-configured",
    service: "HisabKitab",
    status: "ok",
  };
}
