import "server-only";

import { z } from "zod";

import { createSupabaseServerClient } from "@/backend/infrastructure/supabase/server-client";
import { calculateSale } from "@/domain/sales/calculate-sale";
import {
  paiseToDecimalString,
  rupeesToPaise,
} from "@/domain/shared/exact-numbers";
import type { PostSaleInput, PostSaleResult } from "@/shared/contracts/sales";

const decimalAmount = z.string().regex(/^\d+(?:\.\d{1,2})?$/);
const wholeNumber = z.string().regex(/^\d+$/);
const optionalWholeNumber = z.union([z.literal(""), wholeNumber]);

const postSaleSchema = z.object({
  bagCount: optionalWholeNumber,
  brokerageRatePerQuintalRupees: wholeNumber,
  brokerId: optionalWholeNumber,
  businessDate: z.iso.date(),
  buyerDeductionReason: z.string().trim().max(200),
  buyerDeductionRupees: decimalAmount,
  buyerId: wholeNumber,
  commodityId: wholeNumber,
  firmId: wholeNumber,
  idempotencyKey: z.uuid(),
  kantaNumber: z.string().trim().max(100),
  ratePerQuintalRupees: wholeNumber,
  receipts: z
    .array(
      z.object({
        amountRupees: decimalAmount,
        bankAccountId: optionalWholeNumber,
        paymentMode: z.enum(["bank", "cash"]),
      }),
    )
    .max(5),
  remark: z.string().trim().max(1000),
  transportRatePerQuintalRupees: wholeNumber,
  transporterId: optionalWholeNumber,
  vehicleNumber: z.string().trim().max(30),
  weightKg: wholeNumber,
});

export async function postSale(
  untrustedInput: PostSaleInput,
): Promise<PostSaleResult> {
  const parsedInput = postSaleSchema.safeParse(untrustedInput);

  if (!parsedInput.success) {
    return { error: "Check the required sale details.", saleId: null };
  }

  const input = parsedInput.data;
  let calculation: ReturnType<typeof calculateSale>;

  try {
    calculation = calculateSale({
      brokerageRatePerQuintalRupees:
        input.brokerageRatePerQuintalRupees,
      buyerDeductionRupees: input.buyerDeductionRupees,
      ratePerQuintalRupees: input.ratePerQuintalRupees,
      receipts: input.receipts,
      transportRatePerQuintalRupees:
        input.transportRatePerQuintalRupees,
      weightKg: input.weightKg,
    });
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Check the sale values.",
      saleId: null,
    };
  }

  if (
    rupeesToPaise(input.buyerDeductionRupees, "Buyer deduction") > 0n &&
    input.buyerDeductionReason.length === 0
  ) {
    return { error: "Add a reason for the buyer deduction.", saleId: null };
  }

  const hasBroker = input.brokerId.length > 0;
  const hasBrokerageRate = calculation.brokerageRatePerQuintalRupees > 0n;
  if (hasBroker !== hasBrokerageRate) {
    return {
      error: "Select a broker and enter its per-quintal rate together.",
      saleId: null,
    };
  }

  const hasTransporter = input.transporterId.length > 0;
  const hasTransportRate = calculation.transportRatePerQuintalRupees > 0n;
  if (hasTransporter !== hasTransportRate) {
    return {
      error: "Select a transporter and enter its per-quintal rate together.",
      saleId: null,
    };
  }

  if (
    input.receipts.some(
      (receipt) =>
        receipt.paymentMode === "bank" && receipt.bankAccountId.length === 0,
    )
  ) {
    return { error: "Select an account for each bank receipt.", saleId: null };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("post_sale", {
    idempotency_key: input.idempotencyKey,
    payload: {
      bagCount: input.bagCount,
      brokerageRatePerQuintal:
        input.brokerageRatePerQuintalRupees,
      brokerId: input.brokerId,
      businessDate: input.businessDate,
      buyerDeduction: paiseToDecimalString(calculation.buyerDeductionPaise),
      buyerDeductionReason: input.buyerDeductionReason,
      buyerId: input.buyerId,
      commodityId: input.commodityId,
      firmId: input.firmId,
      kantaNumber: input.kantaNumber,
      ratePerQuintal: input.ratePerQuintalRupees,
      receipts: input.receipts.map((receipt, index) => ({
        amount: paiseToDecimalString(
          calculation.receiptAmountsPaise[index]!,
        ),
        bankAccountId:
          receipt.paymentMode === "bank" ? receipt.bankAccountId : "",
        paymentMode: receipt.paymentMode,
        receiptDate: input.businessDate,
      })),
      remark: input.remark,
      transportRatePerQuintal:
        input.transportRatePerQuintalRupees,
      transporterId: input.transporterId,
      vehicleNumber: input.vehicleNumber,
      weightKg: input.weightKg,
    },
  });

  if (error) {
    console.error("Sale posting failed", { code: error.code });
    return { error: "The sale could not be posted. Check the details and try again.", saleId: null };
  }

  if (data === null) {
    return { error: "The sale could not be posted.", saleId: null };
  }

  return { error: null, saleId: String(data) };
}
