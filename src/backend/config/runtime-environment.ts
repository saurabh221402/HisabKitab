import "server-only";

export type RuntimeEnvironment = Readonly<{
  databaseConfigured: boolean;
}>;

export function readRuntimeEnvironment(): RuntimeEnvironment {
  return {
    databaseConfigured: Boolean(
      process.env.DATABASE_URL?.trim() && process.env.DIRECT_URL?.trim(),
    ),
  };
}
