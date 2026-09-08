import "server-only";

import { toPartyReferenceOption } from "@/backend/application/masters/party-reference-option";
import { createSupabaseServerClient } from "@/backend/infrastructure/supabase/server-client";
import type { PurchaseReferenceData } from "@/shared/contracts/purchases";

export async function getPurchaseReferenceData(): Promise<PurchaseReferenceData> {
  const supabase = await createSupabaseServerClient();
  const [firmsResult, commoditiesResult, sellerRolesResult, bankAccountsResult] =
    await Promise.all([
      supabase
        .from("business_firms")
        .select("id, name")
        .eq("is_active", true)
        .order("name"),
      supabase
        .from("commodities")
        .select("id, name")
        .eq("is_active", true)
        .order("name"),
      supabase
        .from("party_roles")
        .select("party_id, parties!inner(id, name, is_active)")
        .eq("role", "seller")
        .eq("parties.is_active", true),
      supabase
        .from("bank_accounts")
        .select("id, firm_id, name")
        .eq("is_active", true)
        .order("name"),
    ]);

  const firstError = [
    firmsResult.error,
    commoditiesResult.error,
    sellerRolesResult.error,
    bankAccountsResult.error,
  ].find(Boolean);

  if (firstError) {
    throw new Error("Unable to load purchase reference data.");
  }

  return {
    bankAccounts: (bankAccountsResult.data ?? []).map((account) => ({
      firmId: String(account.firm_id),
      id: String(account.id),
      name: account.name,
    })),
    commodities: (commoditiesResult.data ?? []).map((commodity) => ({
      id: String(commodity.id),
      name: commodity.name,
    })),
    firms: (firmsResult.data ?? []).map((firm) => ({
      id: String(firm.id),
      name: firm.name,
    })),
    sellers: (sellerRolesResult.data ?? []).flatMap((role) => {
      const party = toPartyReferenceOption(role.parties);
      return party ? [party] : [];
    }),
  };
}
