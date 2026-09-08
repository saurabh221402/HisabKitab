import "server-only";

import { buildPartyPositionReport } from "@/backend/application/parties/build-party-position-report";
import { createSupabaseServerClient } from "@/backend/infrastructure/supabase/server-client";
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

  return buildPartyPositionReport({
    filters,
    firms: (firmsResult.data ?? []).map((firm) => ({
      id: String(firm.id),
      name: firm.name,
    })),
    parties: (partiesResult.data ?? []).map((party) => ({
      id: String(party.id),
      name: party.name,
    })),
    partyRoles: (rolesResult.data ?? []).map((role) => ({
      partyId: String(role.party_id),
      role: role.role,
    })),
    positions: (positionsResult.data ?? []).map((position) => ({
      brokerageOutstanding: String(position.brokerage_outstanding),
      buyerOutstanding: String(position.buyer_outstanding),
      firmId: String(position.firm_id),
      lastActivityDate: position.last_activity_date,
      partyId: String(position.party_id),
      sellerOutstanding: String(position.seller_outstanding),
      transportOutstanding: String(position.transport_outstanding),
    })),
  });
}
