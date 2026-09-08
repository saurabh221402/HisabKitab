"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createSupabaseServerClient } from "@/backend/infrastructure/supabase/server-client";
import { paiseToDecimalString, rupeesToPaise } from "@/domain/shared/exact-numbers";
import type { CashEntryMutationState } from "@/shared/contracts/rokad";

const cashEntrySchema = z.object({
  amount: z.string().regex(/^\d+(?:\.\d{1,2})?$/),
  businessDate: z.iso.date(),
  direction: z.enum(["in", "out"]),
  firmId: z.string().regex(/^\d+$/),
  partyId: z.union([z.literal(""), z.string().regex(/^\d+$/)]),
  personName: z.string().trim().max(150),
  remark: z.string().trim().min(2).max(500),
  requestId: z.uuid(),
});

export async function createCashEntry(
  _previousState: CashEntryMutationState,
  formData: FormData,
): Promise<CashEntryMutationState> {
  const parsedInput = cashEntrySchema.safeParse({
    amount: formData.get("amount"),
    businessDate: formData.get("businessDate"),
    direction: formData.get("direction"),
    firmId: formData.get("firmId"),
    partyId: formData.get("partyId") ?? "",
    personName: formData.get("personName") ?? "",
    remark: formData.get("remark"),
    requestId: formData.get("requestId"),
  });

  if (!parsedInput.success) {
    return { error: "Enter the amount, person, firm, and a clear remark.", success: null };
  }

  const input = parsedInput.data;
  let amountPaise: bigint;

  try {
    amountPaise = rupeesToPaise(input.amount, "Cash amount");
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Check the cash amount.", success: null };
  }

  if (amountPaise <= 0n) {
    return { error: "Cash amount must be greater than zero.", success: null };
  }

  if (!input.partyId && !input.personName) {
    return { error: "Select a party or enter the person's name.", success: null };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("post_cash_entry", {
    idempotency_key: input.requestId,
    payload: {
      amount: paiseToDecimalString(amountPaise),
      businessDate: input.businessDate,
      direction: input.direction,
      firmId: input.firmId,
      partyId: input.partyId,
      personName: input.personName,
      remark: input.remark,
    },
  });

  if (error) {
    return { error: "Cash entry could not be recorded. Check the details and try again.", success: null };
  }

  revalidatePath("/rokad");
  return {
    error: null,
    success: input.direction === "in" ? "Cash In recorded." : "Cash Out recorded.",
  };
}
