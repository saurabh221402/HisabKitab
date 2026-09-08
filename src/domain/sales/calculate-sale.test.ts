import { describe, expect, it } from "vitest";

import { paiseToDecimalString } from "../shared/exact-numbers";

import { calculateSale } from "./calculate-sale";

describe("calculateSale", () => {
  it("reconciles the validated parts of Sale Example 001", () => {
    const result = calculateSale({
      brokerageRatePerQuintalRupees: "0",
      buyerDeductionRupees: "3000",
      ratePerQuintalRupees: "3000",
      receipts: [],
      transportRatePerQuintalRupees: "0",
      weightKg: "30000",
    });

    expect(paiseToDecimalString(result.grossAmountPaise)).toBe("900000.00");
    expect(paiseToDecimalString(result.finalReceivablePaise)).toBe("897000.00");
    expect(paiseToDecimalString(result.pendingBalancePaise)).toBe("897000.00");
  });

  it("tracks brokerage and transport separately from buyer receivable", () => {
    const result = calculateSale({
      brokerageRatePerQuintalRupees: "10",
      buyerDeductionRupees: "3000",
      ratePerQuintalRupees: "3000",
      receipts: [{ amountRupees: "500000" }, { amountRupees: "100000" }],
      transportRatePerQuintalRupees: "20",
      weightKg: "30000",
    });

    expect(paiseToDecimalString(result.brokerageAmountPaise)).toBe("3000.00");
    expect(paiseToDecimalString(result.transportAmountPaise)).toBe("6000.00");
    expect(paiseToDecimalString(result.finalReceivablePaise)).toBe("897000.00");
    expect(paiseToDecimalString(result.pendingBalancePaise)).toBe("297000.00");
  });

  it("keeps paise exact for kilogram conversion", () => {
    const result = calculateSale({
      brokerageRatePerQuintalRupees: "0",
      buyerDeductionRupees: "0",
      ratePerQuintalRupees: "3001",
      receipts: [],
      transportRatePerQuintalRupees: "0",
      weightKg: "1",
    });

    expect(paiseToDecimalString(result.grossAmountPaise)).toBe("30.01");
  });

  it("rejects receipts above the final receivable", () => {
    expect(() =>
      calculateSale({
        brokerageRatePerQuintalRupees: "0",
        buyerDeductionRupees: "3000",
        ratePerQuintalRupees: "3000",
        receipts: [{ amountRupees: "897001" }],
        transportRatePerQuintalRupees: "0",
        weightKg: "30000",
      }),
    ).toThrow("Amount received cannot exceed");
  });
});
