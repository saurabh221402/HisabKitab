import { describe, expect, it } from "vitest";

import { getSystemHealth } from "./get-system-health";

describe("getSystemHealth", () => {
  it("reports database configuration without exposing credentials", () => {
    const result = getSystemHealth({
      supabaseConfigured: true,
      now: new Date("2026-09-07T12:00:00.000Z"),
    });

    expect(result).toEqual({
      checkedAt: "2026-09-07T12:00:00.000Z",
      databaseConfiguration: "configured",
      service: "HisabKitab",
      status: "ok",
    });
    expect(JSON.stringify(result)).not.toContain("password");
  });
});
