import { describe, expect, it } from "vitest";

import { formatIndianCurrency } from "./format-money";

describe("formatIndianCurrency", () => {
  it("formats Indian grouping and optional paise", () => {
    expect(formatIndianCurrency("897000.00")).toBe("₹8,97,000");
    expect(formatIndianCurrency("373100.25")).toBe("₹3,73,100.25");
  });

  it("keeps negative paise exact", () => {
    expect(formatIndianCurrency("-123.45")).toBe("−₹123.45");
  });
});
