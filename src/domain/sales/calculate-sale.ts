import {
  parseWholeNumber,
  rupeesToPaise,
} from "../shared/exact-numbers";

export type SaleReceiptInput = Readonly<{
  amountRupees: string;
}>;

export type SaleCalculationInput = Readonly<{
  brokerageRatePerQuintalRupees: string;
  buyerDeductionRupees: string;
  ratePerQuintalRupees: string;
  receipts: readonly SaleReceiptInput[];
  transportRatePerQuintalRupees: string;
  weightKg: string;
}>;

export type SaleCalculation = Readonly<{
  amountReceivedPaise: bigint;
  brokerageAmountPaise: bigint;
  brokerageRatePerQuintalRupees: bigint;
  buyerDeductionPaise: bigint;
  finalReceivablePaise: bigint;
  grossAmountPaise: bigint;
  pendingBalancePaise: bigint;
  receiptAmountsPaise: readonly bigint[];
  ratePerQuintalRupees: bigint;
  transportAmountPaise: bigint;
  transportRatePerQuintalRupees: bigint;
  weightKg: bigint;
}>;

export class SaleCalculationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SaleCalculationError";
  }
}

export function calculateSale(input: SaleCalculationInput): SaleCalculation {
  const weightKg = parseWholeNumber(input.weightKg, "Sale weight");
  const ratePerQuintalRupees = parseWholeNumber(
    input.ratePerQuintalRupees,
    "Sale rate",
  );
  const brokerageRatePerQuintalRupees = parseWholeNumber(
    input.brokerageRatePerQuintalRupees,
    "Brokerage rate",
  );
  const transportRatePerQuintalRupees = parseWholeNumber(
    input.transportRatePerQuintalRupees,
    "Transport rate",
  );

  if (weightKg <= 0n) {
    throw new SaleCalculationError("Sale weight must be greater than zero.");
  }

  if (ratePerQuintalRupees <= 0n) {
    throw new SaleCalculationError("Sale rate must be greater than zero.");
  }

  // kg ÷ 100 × rupees/Qt × 100 paise/rupee = kg × rate paise.
  const grossAmountPaise = weightKg * ratePerQuintalRupees;
  const buyerDeductionPaise = rupeesToPaise(
    input.buyerDeductionRupees,
    "Buyer deduction",
  );

  if (buyerDeductionPaise > grossAmountPaise) {
    throw new SaleCalculationError(
      "Buyer deduction cannot exceed the gross sale amount.",
    );
  }

  const receiptAmountsPaise = input.receipts.map((receipt, index) => {
    const amount = rupeesToPaise(
      receipt.amountRupees,
      `Receipt ${index + 1}`,
    );

    if (amount <= 0n) {
      throw new SaleCalculationError("Each receipt must be greater than zero.");
    }

    return amount;
  });
  const finalReceivablePaise = grossAmountPaise - buyerDeductionPaise;
  const amountReceivedPaise = receiptAmountsPaise.reduce(
    (total, amount) => total + amount,
    0n,
  );

  if (amountReceivedPaise > finalReceivablePaise) {
    throw new SaleCalculationError(
      "Amount received cannot exceed the final buyer receivable.",
    );
  }

  return {
    amountReceivedPaise,
    brokerageAmountPaise: weightKg * brokerageRatePerQuintalRupees,
    brokerageRatePerQuintalRupees,
    buyerDeductionPaise,
    finalReceivablePaise,
    grossAmountPaise,
    pendingBalancePaise: finalReceivablePaise - amountReceivedPaise,
    receiptAmountsPaise,
    ratePerQuintalRupees,
    transportAmountPaise: weightKg * transportRatePerQuintalRupees,
    transportRatePerQuintalRupees,
    weightKg,
  };
}
