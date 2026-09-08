import "server-only";

import { createSupabaseServerClient } from "@/backend/infrastructure/supabase/server-client";
import type { DashboardOverview } from "@/shared/contracts/dashboard";

type DashboardSummaryRow = Readonly<{
  bank_balance: string | number;
  buyer_outstanding: string | number;
  cash_opening_configured: boolean;
  gross_sale_value: string | number;
  net_purchase_value: string | number;
  operational_cash_balance: string | number;
  purchase_count: string | number;
  purchase_weight_kg: string | number;
  sale_count: string | number;
  sale_weight_kg: string | number;
  seller_outstanding: string | number;
  total_available_funds: string | number;
}>;

export async function getDashboardOverview(
  businessDate: string,
): Promise<DashboardOverview> {
  const supabase = await createSupabaseServerClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = typeof claimsData?.claims.sub === "string" ? claimsData.claims.sub : null;

  const [summaryResult, recentResult, firmsResult, partiesResult, profileResult] =
    await Promise.all([
      supabase.rpc("get_dashboard_overview", { target_date: businessDate }).single(),
      supabase
        .from("recent_transactions")
        .select(
          "transaction_type, transaction_id, business_date, firm_id, party_id, weight_kg, amount, pending_balance, created_at",
        )
        .order("created_at", { ascending: false })
        .limit(8),
      supabase.from("business_firms").select("id, name"),
      supabase.from("parties").select("id, name").eq("is_active", true),
      userId
        ? supabase
            .from("user_profiles")
            .select("display_name")
            .eq("user_id", userId)
            .maybeSingle()
        : Promise.resolve({ data: null, error: null }),
    ]);

  const firstError = [
    summaryResult.error,
    recentResult.error,
    firmsResult.error,
    partiesResult.error,
    profileResult.error,
  ].find(Boolean);
  const summary = summaryResult.data as DashboardSummaryRow | null;

  if (firstError || !summary) {
    throw new Error("Unable to load the business overview.");
  }

  const firmNames = new Map(
    (firmsResult.data ?? []).map((firm) => [String(firm.id), firm.name]),
  );
  const partyNames = new Map(
    (partiesResult.data ?? []).map((party) => [String(party.id), party.name]),
  );
  const purchaseWeightKg = BigInt(String(summary.purchase_weight_kg));
  const saleWeightKg = BigInt(String(summary.sale_weight_kg));

  return {
    businessDate,
    buyerOutstanding: {
      helper: "लेना है · Amount to receive",
      value: String(summary.buyer_outstanding),
    },
    cashOpeningConfigured: summary.cash_opening_configured,
    displayName: profileResult.data?.display_name ?? "Main user",
    grossSale: {
      helper: `${String(summary.sale_count)} posted sale${String(summary.sale_count) === "1" ? "" : "s"} today`,
      value: String(summary.gross_sale_value),
    },
    netPurchase: {
      helper: `${String(summary.purchase_count)} posted purchase${String(summary.purchase_count) === "1" ? "" : "s"} today`,
      value: String(summary.net_purchase_value),
    },
    recentTransactions: (recentResult.data ?? []).map((transaction) => {
      const transactionType = transaction.transaction_type as "purchase" | "sale";
      const transactionId = String(transaction.transaction_id);

      return {
        amount: String(transaction.amount),
        businessDate: transaction.business_date,
        firmName: firmNames.get(String(transaction.firm_id)) ?? "Business firm",
        id: `${transactionType}-${transactionId}`,
        partyName: partyNames.get(String(transaction.party_id)) ?? "Party",
        pendingBalance: String(transaction.pending_balance),
        transactionType,
        url:
          transactionType === "purchase"
            ? `/purchases/${transactionId}`
            : `/sales/${transactionId}`,
        weightKg: String(transaction.weight_kg),
      };
    }),
    saleWeightKg: saleWeightKg.toString(),
    sellerOutstanding: {
      helper: "देना है · Amount to give",
      value: String(summary.seller_outstanding),
    },
    totalAvailableFunds: String(summary.total_available_funds),
    totalWeightKg: (purchaseWeightKg + saleWeightKg).toString(),
  };
}
