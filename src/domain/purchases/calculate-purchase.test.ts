import { describe, expect, it } from "vitest";

import {
  calculatePurchase,
  PurchaseCalculationError,
} from "./calculate-purchase";
import { paiseToDecimalString } from "../shared/exact-numbers";

const canonicalPurchase = {
  emptyWeightKg: "8500",
  lines: [
    {
      commodityId: "rice",
      commodityName: "Rice",
      deductionRupees: "2000",
      ratePerQuintalRupees: "4500",
      weightKg: "6200",
    },
    {
      commodityId: "wheat",
      commodityName: "Wheat",
      deductionRupees: "1000",
      ratePerQuintalRupees: "2700",
      weightKg: "3800",
    },
  ],
  loadedWeightKg: "18500",
  paidRupees: "200000",
  purchaseDeductionRupees: "5500",
} as const;

describe("calculatePurchase", () => {
  it("reconciles Purchase Example 001 exactly", () => {
    const result = calculatePurchase(canonicalPurchase);

    expect(result.netWeightKg).toBe(10_000n);
    expect(paiseToDecimalString(result.lines[0]!.grossAmountPaise)).toBe(
      "279000.00",
    );
    expect(paiseToDecimalString(result.commodityTotalPaise)).toBe("378600.00");
    expect(paiseToDecimalString(result.finalPayablePaise)).toBe("373100.00");
    expect(paiseToDecimalString(result.pendingBalancePaise)).toBe("173100.00");
  });

  it("keeps paise exact when kg conversion produces a fractional rupee", () => {
    const result = calculatePurchase({
      emptyWeightKg: "1000",
      lines: [
        {
          commodityId: "rice",
          commodityName: "Rice",
          deductionRupees: "0",
          ratePerQuintalRupees: "3001",
          weightKg: "1",
        },
      ],
      loadedWeightKg: "1001",
      paidRupees: "0",
      purchaseDeductionRupees: "0",
    });

    expect(paiseToDecimalString(result.finalPayablePaise)).toBe("30.01");
  });

  it("rejects commodity weight that does not match Kanta net weight", () => {
    expect(() =>
      calculatePurchase({
        ...canonicalPurchase,
        lines: [canonicalPurchase.lines[0]],
      }),
    ).toThrow(PurchaseCalculationError);
  });

  it("rejects overpayment", () => {
    expect(() =>
      calculatePurchase({
        ...canonicalPurchase,
        paidRupees: "373101",
      }),
    ).toThrow("Amount paid cannot exceed");
  });
});
