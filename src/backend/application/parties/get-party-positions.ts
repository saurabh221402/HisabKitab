import "server-only";

import { createSupabaseServerClient } from "@/backend/infrastructure/supabase/server-client";
import {
  paiseToDecimalString,
  rupeesToPaise,
} from "@/domain/shared/exact-numbers";
import type { PartyPositionReport } from "@/shared/contracts/party-positions";

export async function getPartyPositions(filters: {
  firmId: string | null;
  role: string | null;
  search: string | null;
}): Promise<PartyPositionReport> {
  const supabase = await createSupabaseServerClient();
  let positionsQuery = supabase
    .from("party_positions")
    .select(
      "firm_id, party_id, seller_outstanding, buyer_outstanding, brokerage_outstanding, transport_outstanding, last_activity_date",
    )
    .order("last_activity_date", { ascending: false })
    .limit(200);

  if (filters.firmId && /^\d+$/.test(filters.firmId)) {
    positionsQuery = positionsQuery.eq("firm_id", filters.firmId);
  }

  const [positionsResult, firmsResult, partiesResult, rolesResult] =
    await Promise.all([
      positionsQuery,
      supabase.from("business_firms").select("id, name").order("name"),
      supabase.from("parties").select("id, name").eq("is_active", true),
      supabase.from("party_roles").select("party_id, role"),
    ]);

  const firstError = [
    positionsResult.error,
    firmsResult.error,
    partiesResult.error,
    rolesResult.error,
  ].find(Boolean);

  if (firstError) {
    throw new Error("Unable to load party positions.");
  }

  const firms = (firmsResult.data ?? []).map((firm) => ({
    id: String(firm.id),
    name: firm.name,
  }));
  const firmNames = new Map(firms.map((firm) => [firm.id, firm.name]));
  const partyNames = new Map(
    (partiesResult.data ?? []).map((party) => [String(party.id), party.name]),
  );
  const partyRoles = new Map<string, string[]>();

  for (const role of rolesResult.data ?? []) {
    const partyId = String(role.party_id);
    const roles = partyRoles.get(partyId) ?? [];
    roles.push(role.role);
    partyRoles.set(partyId, roles);
  }

  const normalizedSearch = filters.search?.trim().toLocaleLowerCase("en-IN") ?? "";
  const positions = (positionsResult.data ?? [])
    .map((position) => {
      const partyId = String(position.party_id);
      return {
        brokerageOutstanding: String(position.brokerage_outstanding),
        buyerOutstanding: String(position.buyer_outstanding),
        firmId: String(position.firm_id),
        firmName: firmNames.get(String(position.firm_id)) ?? "Business firm",
        lastActivityDate: position.last_activity_date,
        partyId,
        partyName: partyNames.get(partyId) ?? "Party",
        roles: partyRoles.get(partyId) ?? [],
        sellerOutstanding: String(position.seller_outstanding),
        transportOutstanding: String(position.transport_outstanding),
      };
    })
    .filter((position) =>
      filters.role ? position.roles.includes(filters.role) : true,
    )
    .filter((position) =>
      normalizedSearch
        ? position.partyName.toLocaleLowerCase("en-IN").includes(normalizedSearch)
        : true,
    );

  const totals = positions.reduce(
    (total, position) => ({
      buyer:
        total.buyer +
        rupeesToPaise(position.buyerOutstanding, "Buyer outstanding"),
      payable:
        total.payable +
        rupeesToPaise(position.sellerOutstanding, "Seller outstanding") +
        rupeesToPaise(position.brokerageOutstanding, "Brokerage outstanding") +
        rupeesToPaise(position.transportOutstanding, "Transport outstanding"),
    }),
    { buyer: 0n, payable: 0n },
  );

  return {
    firms,
    positions,
    totalBuyerOutstanding: paiseToDecimalString(totals.buyer),
    totalSellerAndCostOutstanding: paiseToDecimalString(totals.payable),
  };
}
