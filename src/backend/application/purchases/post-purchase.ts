import "server-only";

import { z } from "zod";

import { calculatePurchase } from "@/domain/purchases/calculate-purchase";
import {
  paiseToDecimalString,
  rupeesToPaise,
} from "@/domain/shared/exact-numbers";
import { createSupabaseServerClient } from "@/backend/infrastructure/supabase/server-client";
import type {
  PostPurchaseInput,
  PostPurchaseResult,
} from "@/shared/contracts/purchases";

const decimalAmount = z.string().regex(/^\d+(?:\.\d{1,2})?$/);
const wholeNumber = z.string().regex(/^\d+$/);

const postPurchaseSchema = z.object({
  bankAccountId: z.string(),
  businessDate: z.iso.date(),
  emptyWeightKg: wholeNumber,
  firmId: wholeNumber,
  idempotencyKey: z.uuid(),
  kantaNumber: z.string().trim().max(100),
  lines: z
    .array(
      z.object({
        commodityId: wholeNumber,
        commodityName: z.string().trim().min(1).max(100),
        deductionReason: z.string().trim().max(200),
        deductionRupees: decimalAmount,
        isResidual: z.boolean(),
        ratePerQuintalRupees: wholeNumber,
        weightKg: wholeNumber,
      }),
    )
    .min(1)
    .max(10),
  loadedWeightKg: wholeNumber,
  paidRupees: decimalAmount,
  paymentMode: z.enum(["bank", "cash"]),
  purchaseDeductionRupees: decimalAmount,
  remark: z.string().trim().max(1000),
  sellerId: wholeNumber,
  vehicleNumber: z.string().trim().min(3).max(30),
});

export async function postPurchase(
  untrustedInput: PostPurchaseInput,
): Promise<PostPurchaseResult> {
  const parsedInput = postPurchaseSchema.safeParse(untrustedInput);

  if (!parsedInput.success) {
    return { error: "Check the required purchase details.", purchaseId: null };
  }

  const input = parsedInput.data;
  let calculation: ReturnType<typeof calculatePurchase>;

  try {
    calculation = calculatePurchase({
      emptyWeightKg: input.emptyWeightKg,
      lines: input.lines,
      loadedWeightKg: input.loadedWeightKg,
      paidRupees: input.paidRupees,
      purchaseDeductionRupees: input.purchaseDeductionRupees,
    });
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Check the purchase values.",
      purchaseId: null,
    };
  }

  if (
    input.lines.some(
      (line) =>
        rupeesToPaise(line.deductionRupees, "Commodity deduction") > 0n &&
        line.deductionReason.length === 0,
    )
  ) {
    return { error: "Add a reason for each commodity deduction.", purchaseId: null };
  }

  if (input.paymentMode === "bank" && !wholeNumber.safeParse(input.bankAccountId).success) {
    return { error: "Select the bank account used for payment.", purchaseId: null };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("post_purchase", {
    idempotency_key: input.idempotencyKey,
    payload: {
      businessDate: input.businessDate,
      emptyWeightKg: input.emptyWeightKg,
      firmId: input.firmId,
      kantaNumber: input.kantaNumber,
      lines: input.lines.map((line, index) => ({
        commodity_id: line.commodityId,
        deduction_reason: line.deductionReason,
        is_residual: line.isResidual,
        line_deduction: paiseToDecimalString(
          calculation.lines[index]!.deductionPaise,
        ),
        rate_per_quintal: line.ratePerQuintalRupees,
        weight_kg: line.weightKg,
      })),
      loadedWeightKg: input.loadedWeightKg,
      payments:
        calculation.amountPaidPaise > 0n
          ? [
              {
                amount: paiseToDecimalString(calculation.amountPaidPaise),
                bankAccountId:
                  input.paymentMode === "bank" ? input.bankAccountId : "",
                paymentDate: input.businessDate,
                paymentMode: input.paymentMode,
              },
            ]
          : [],
      purchaseDeduction: paiseToDecimalString(
        calculation.purchaseDeductionPaise,
      ),
      remark: input.remark,
      sellerId: input.sellerId,
      vehicleNumber: input.vehicleNumber,
    },
  });

  if (error) {
    console.error("Purchase posting failed", { code: error.code });
    return {
      error:
        error.code === "23505"
          ? "A purchase with this Kanta reference already exists for the selected firm and date."
          : "The purchase could not be posted. Check the details and try again.",
      purchaseId: null,
    };
  }

  if (data === null) {
    return { error: "The purchase could not be posted.", purchaseId: null };
  }

  return { error: null, purchaseId: String(data) };
}
