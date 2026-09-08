import "server-only";

import { createSupabaseServerClient } from "@/backend/infrastructure/supabase/server-client";
import type { SaleDetails } from "@/shared/contracts/sales";

export async function getSaleDetails(saleId: string): Promise<SaleDetails | null> {
  if (!/^\d+$/.test(saleId)) return null;

  const supabase = await createSupabaseServerClient();
  const { data: summary, error: summaryError } = await supabase
    .from("sale_summaries")
    .select(
      "id, firm_id, business_date, buyer_id, commodity_id, bag_count, weight_kg, rate_per_quintal, gross_amount, buyer_deduction, buyer_deduction_reason, final_receivable, broker_id, brokerage_rate_per_quintal, brokerage_amount, transporter_id, transport_rate_per_quintal, transport_amount, amount_received, pending_balance, vehicle_number, kanta_number, status",
    )
    .eq("id", saleId)
    .maybeSingle();

  if (summaryError) throw new Error("Unable to load the sale.");
  if (!summary) return null;

  const [
    firmResult,
    buyerResult,
    commodityResult,
    brokerResult,
    transporterResult,
    receiptsResult,
  ] = await Promise.all([
    supabase.from("business_firms").select("name").eq("id", summary.firm_id).single(),
    supabase.from("parties").select("name").eq("id", summary.buyer_id).single(),
    supabase.from("commodities").select("name").eq("id", summary.commodity_id).single(),
    summary.broker_id
      ? supabase.from("parties").select("name").eq("id", summary.broker_id).single()
      : Promise.resolve({ data: null, error: null }),
    summary.transporter_id
      ? supabase.from("parties").select("name").eq("id", summary.transporter_id).single()
      : Promise.resolve({ data: null, error: null }),
    supabase
      .from("sale_receipts")
      .select("receipt_date, payment_mode, amount")
      .eq("sale_id", saleId)
      .order("created_at"),
  ]);

  if (
    firmResult.error ||
    buyerResult.error ||
    commodityResult.error ||
    brokerResult.error ||
    transporterResult.error ||
    receiptsResult.error
  ) {
    throw new Error("Unable to load complete sale details.");
  }

  return {
    amountReceived: String(summary.amount_received),
    bagCount: summary.bag_count === null ? null : String(summary.bag_count),
    brokerageAmount: String(summary.brokerage_amount),
    brokerageRatePerQuintal: String(summary.brokerage_rate_per_quintal),
    brokerName: brokerResult.data?.name ?? null,
    businessDate: summary.business_date,
    buyerDeduction: String(summary.buyer_deduction),
    buyerDeductionReason: summary.buyer_deduction_reason,
    buyerName: buyerResult.data.name,
    commodityName: commodityResult.data.name,
    finalReceivable: String(summary.final_receivable),
    firmName: firmResult.data.name,
    grossAmount: String(summary.gross_amount),
    id: String(summary.id),
    kantaNumber: summary.kanta_number,
    pendingBalance: String(summary.pending_balance),
    ratePerQuintal: String(summary.rate_per_quintal),
    receipts: (receiptsResult.data ?? []).map((receipt) => ({
      amount: String(receipt.amount),
      mode: receipt.payment_mode as "bank" | "cash",
      receiptDate: receipt.receipt_date,
    })),
    status: summary.status as "draft" | "posted" | "reversed",
    transportAmount: String(summary.transport_amount),
    transportRatePerQuintal: String(summary.transport_rate_per_quintal),
    transporterName: transporterResult.data?.name ?? null,
    vehicleNumber: summary.vehicle_number,
    weightKg: String(summary.weight_kg),
  };
}
