import {
  parseWholeNumber,
  rupeesToPaise,
} from "../shared/exact-numbers";

export type PurchaseLineInput = Readonly<{
  commodityId: string;
  commodityName: string;
  deductionRupees: string;
  ratePerQuintalRupees: string;
  weightKg: string;
}>;

export type PurchaseCalculationInput = Readonly<{
  emptyWeightKg: string;
  loadedWeightKg: string;
  paidRupees: string;
  purchaseDeductionRupees: string;
  lines: readonly PurchaseLineInput[];
}>;

export type CalculatedPurchaseLine = Readonly<{
  commodityId: string;
  commodityName: string;
  deductionPaise: bigint;
  finalAmountPaise: bigint;
  grossAmountPaise: bigint;
  ratePerQuintalRupees: bigint;
  weightKg: bigint;
}>;

export type PurchaseCalculation = Readonly<{
  amountPaidPaise: bigint;
  commodityTotalPaise: bigint;
  emptyWeightKg: bigint;
  finalPayablePaise: bigint;
  lines: readonly CalculatedPurchaseLine[];
  loadedWeightKg: bigint;
  netWeightKg: bigint;
  pendingBalancePaise: bigint;
  purchaseDeductionPaise: bigint;
}>;

export class PurchaseCalculationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PurchaseCalculationError";
  }
}

export function calculatePurchase(
  input: PurchaseCalculationInput,
): PurchaseCalculation {
  const loadedWeightKg = parseWholeNumber(input.loadedWeightKg, "Loaded weight");
  const emptyWeightKg = parseWholeNumber(input.emptyWeightKg, "Empty weight");

  if (loadedWeightKg <= emptyWeightKg) {
    throw new PurchaseCalculationError(
      "Loaded weight must be greater than empty weight.",
    );
  }

  if (input.lines.length === 0) {
    throw new PurchaseCalculationError("Add at least one commodity.");
  }

  const netWeightKg = loadedWeightKg - emptyWeightKg;
  const lines = input.lines.map((line) => {
    const weightKg = parseWholeNumber(
      line.weightKg,
      `${line.commodityName} weight`,
    );
    const ratePerQuintalRupees = parseWholeNumber(
      line.ratePerQuintalRupees,
      `${line.commodityName} rate`,
    );
    const deductionPaise = rupeesToPaise(
      line.deductionRupees,
      `${line.commodityName} deduction`,
    );

    if (weightKg <= 0n) {
      throw new PurchaseCalculationError(
        `${line.commodityName} weight must be greater than zero.`,
      );
    }

    if (ratePerQuintalRupees <= 0n) {
      throw new PurchaseCalculationError(
        `${line.commodityName} rate must be greater than zero.`,
      );
    }

    // kg ÷ 100 × rupees/Qt × 100 paise/rupee = kg × rate paise.
    const grossAmountPaise = weightKg * ratePerQuintalRupees;

    if (deductionPaise > grossAmountPaise) {
      throw new PurchaseCalculationError(
        `${line.commodityName} deduction cannot exceed its gross amount.`,
      );
    }

    return {
      commodityId: line.commodityId,
      commodityName: line.commodityName,
      deductionPaise,
      finalAmountPaise: grossAmountPaise - deductionPaise,
      grossAmountPaise,
      ratePerQuintalRupees,
      weightKg,
    } satisfies CalculatedPurchaseLine;
  });

  const allocatedWeightKg = lines.reduce(
    (total, line) => total + line.weightKg,
    0n,
  );

  if (allocatedWeightKg !== netWeightKg) {
    throw new PurchaseCalculationError(
      `Commodity weight must equal Kanta net weight (${netWeightKg} kg).`,
    );
  }

  const commodityTotalPaise = lines.reduce(
    (total, line) => total + line.finalAmountPaise,
    0n,
  );
  const purchaseDeductionPaise = rupeesToPaise(
    input.purchaseDeductionRupees,
    "Purchase deduction",
  );

  if (purchaseDeductionPaise > commodityTotalPaise) {
    throw new PurchaseCalculationError(
      "Purchase deduction cannot exceed the commodity total.",
    );
  }

  const finalPayablePaise = commodityTotalPaise - purchaseDeductionPaise;
  const amountPaidPaise = rupeesToPaise(input.paidRupees, "Amount paid");

  if (amountPaidPaise > finalPayablePaise) {
    throw new PurchaseCalculationError(
      "Amount paid cannot exceed the final payable amount.",
    );
  }

  return {
    amountPaidPaise,
    commodityTotalPaise,
    emptyWeightKg,
    finalPayablePaise,
    lines,
    loadedWeightKg,
    netWeightKg,
    pendingBalancePaise: finalPayablePaise - amountPaidPaise,
    purchaseDeductionPaise,
  };
}
