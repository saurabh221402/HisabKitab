import "server-only";

import { createSupabaseServerClient } from "@/backend/infrastructure/supabase/server-client";
import type { PurchaseDetails } from "@/shared/contracts/purchases";

export async function getPurchaseDetails(
  purchaseId: string,
): Promise<PurchaseDetails | null> {
  if (!/^\d+$/.test(purchaseId)) return null;

  const supabase = await createSupabaseServerClient();
  const { data: summary, error: summaryError } = await supabase
    .from("purchase_summaries")
    .select(
      "id, firm_id, seller_id, business_date, vehicle_number, kanta_number, loaded_weight_kg, empty_weight_kg, net_weight_kg, commodity_total, seller_deduction, final_payable, amount_paid, pending_balance, status",
    )
    .eq("id", purchaseId)
    .maybeSingle();

  if (summaryError) throw new Error("Unable to load the purchase.");
  if (!summary) return null;

  const [firmResult, sellerResult, linesResult, paymentsResult] = await Promise.all([
    supabase.from("business_firms").select("name").eq("id", summary.firm_id).single(),
    supabase.from("parties").select("name").eq("id", summary.seller_id).single(),
    supabase
      .from("purchase_lines")
      .select(
        "weight_kg, rate_per_quintal, gross_amount, line_deduction, final_amount, deduction_reason, sort_order, commodities(name)",
      )
      .eq("purchase_id", purchaseId)
      .order("sort_order"),
    supabase
      .from("purchase_payments")
      .select("payment_date, payment_mode, amount")
      .eq("purchase_id", purchaseId)
      .order("created_at"),
  ]);

  if (
    firmResult.error ||
    sellerResult.error ||
    linesResult.error ||
    paymentsResult.error
  ) {
    throw new Error("Unable to load complete purchase details.");
  }

  return {
    amountPaid: String(summary.amount_paid),
    businessDate: summary.business_date,
    commodityTotal: String(summary.commodity_total),
    emptyWeightKg: String(summary.empty_weight_kg),
    finalPayable: String(summary.final_payable),
    firmName: firmResult.data.name,
    id: String(summary.id),
    kantaNumber: summary.kanta_number,
    lines: (linesResult.data ?? []).map((line) => ({
      commodityName: line.commodities[0]?.name ?? "Commodity",
      deduction: String(line.line_deduction),
      deductionReason: line.deduction_reason,
      finalAmount: String(line.final_amount),
      grossAmount: String(line.gross_amount),
      ratePerQuintal: String(line.rate_per_quintal),
      weightKg: String(line.weight_kg),
    })),
    loadedWeightKg: String(summary.loaded_weight_kg),
    netWeightKg: String(summary.net_weight_kg),
    payments: (paymentsResult.data ?? []).map((payment) => ({
      amount: String(payment.amount),
      mode: payment.payment_mode as "bank" | "cash",
      paymentDate: payment.payment_date,
    })),
    pendingBalance: String(summary.pending_balance),
    sellerDeduction: String(summary.seller_deduction),
    sellerName: sellerResult.data.name,
    status: summary.status as "draft" | "posted" | "reversed",
    vehicleNumber: summary.vehicle_number,
  };
}
