import "server-only";

import { createSupabaseServerClient } from "@/backend/infrastructure/supabase/server-client";
import type {
  RokadDay,
  RokadReferenceData,
} from "@/shared/contracts/rokad";

const datePattern = /^\d{4}-\d{2}-\d{2}$/;

type RokadSummaryRow = Readonly<{
  cash_in: string | number;
  cash_out: string | number;
  closing_balance: string | number;
  opening_balance: string | number;
  opening_configured: boolean;
  opening_date: string | null;
}>;

export async function getRokadDay(
  businessDate: string,
): Promise<{ day: RokadDay; referenceData: RokadReferenceData }> {
  if (!datePattern.test(businessDate)) {
    throw new Error("Invalid Rokad date.");
  }

  const supabase = await createSupabaseServerClient();
  const [summaryResult, movementsResult, firmsResult, partiesResult] =
    await Promise.all([
      supabase.rpc("get_rokad_day", { target_date: businessDate }).single(),
      supabase
        .from("cash_movements")
        .select(
          "source_type, source_record_id, transaction_id, firm_id, direction, amount, party_id, counterparty_name, remark, created_at",
        )
        .eq("business_date", businessDate)
        .order("created_at", { ascending: false }),
      supabase
        .from("business_firms")
        .select("id, name")
        .eq("is_active", true)
        .order("name"),
      supabase
        .from("parties")
        .select("id, name")
        .eq("is_active", true)
        .order("name"),
    ]);

  const firstError = [
    summaryResult.error,
    movementsResult.error,
    firmsResult.error,
    partiesResult.error,
  ].find(Boolean);

  const summary = summaryResult.data as RokadSummaryRow | null;

  if (firstError || !summary) {
    throw new Error("Unable to load the daily Rokad.");
  }

  const firmNames = new Map(
    (firmsResult.data ?? []).map((firm) => [String(firm.id), firm.name]),
  );
  const partyNames = new Map(
    (partiesResult.data ?? []).map((party) => [String(party.id), party.name]),
  );

  const sourcePresentation = (sourceType: string, transactionId: unknown) => {
    if (sourceType === "purchase_payment") {
      return {
        label: "Purchase payment",
        url: transactionId ? `/purchases/${String(transactionId)}` : null,
      };
    }

    if (sourceType === "sale_receipt") {
      return {
        label: "Sale receipt",
        url: transactionId ? `/sales/${String(transactionId)}` : null,
      };
    }

    return { label: "Manual entry", url: null };
  };

  return {
    day: {
      businessDate,
      cashIn: String(summary.cash_in),
      cashOut: String(summary.cash_out),
      closingBalance: String(summary.closing_balance),
      movements: (movementsResult.data ?? []).map((movement) => {
        const source = sourcePresentation(
          movement.source_type,
          movement.transaction_id,
        );

        return {
          amount: String(movement.amount),
          createdAt: movement.created_at,
          direction: movement.direction as "in" | "out",
          firmName: firmNames.get(String(movement.firm_id)) ?? "Business firm",
          id: `${movement.source_type}-${String(movement.source_record_id)}`,
          partyName:
            (movement.party_id
              ? partyNames.get(String(movement.party_id))
              : null) ??
            movement.counterparty_name ??
            "Person",
          remark: movement.remark,
          sourceLabel: source.label,
          sourceUrl: source.url,
        };
      }),
      openingBalance: String(summary.opening_balance),
      openingConfigured: summary.opening_configured,
      openingDate: summary.opening_date,
    },
    referenceData: {
      firms: (firmsResult.data ?? []).map((firm) => ({
        id: String(firm.id),
        name: firm.name,
      })),
      parties: (partiesResult.data ?? []).map((party) => ({
        id: String(party.id),
        name: party.name,
      })),
    },
  };
}
