import { getSystemHealth } from "@/backend/application/system/get-system-health";
import { readRuntimeEnvironment } from "@/backend/config/runtime-environment";

export const dynamic = "force-dynamic";

export function GET(): Response {
  const environment = readRuntimeEnvironment();
  const health = getSystemHealth({
    databaseConfigured: environment.databaseConfigured,
    now: new Date(),
  });

  return Response.json(health, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
