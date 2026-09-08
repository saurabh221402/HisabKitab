import "server-only";

import { createSupabaseServerClient } from "@/backend/infrastructure/supabase/server-client";
import type {
  MasterDataOverview,
  PartyRole,
} from "@/shared/contracts/master-data";

export async function getMasterData(): Promise<MasterDataOverview> {
  const supabase = await createSupabaseServerClient();
  const [partiesResult, commoditiesResult] = await Promise.all([
    supabase
      .from("parties")
      .select("id, name, mobile, address, gstin, party_roles(role)")
      .eq("is_active", true)
      .order("name"),
    supabase
      .from("commodities")
      .select("id, name, local_name")
      .eq("is_active", true)
      .order("name"),
  ]);

  if (partiesResult.error || commoditiesResult.error) {
    throw new Error("Unable to load master data.");
  }

  return {
    commodities: (commoditiesResult.data ?? []).map((commodity) => ({
      id: String(commodity.id),
      localName: commodity.local_name,
      name: commodity.name,
    })),
    parties: (partiesResult.data ?? []).map((party) => ({
      address: party.address,
      gstin: party.gstin,
      id: String(party.id),
      mobile: party.mobile,
      name: party.name,
      roles: party.party_roles.map((role) => role.role as PartyRole),
    })),
  };
}
