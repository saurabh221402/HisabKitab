import "server-only";

import { createSupabaseServerClient } from "@/backend/infrastructure/supabase/server-client";
import type {
  SaleReferenceData,
  SaleReferenceOption,
} from "@/shared/contracts/sales";

export async function getSaleReferenceData(): Promise<SaleReferenceData> {
  const supabase = await createSupabaseServerClient();
  const [firmsResult, commoditiesResult, rolesResult, bankAccountsResult] =
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
        .select("role, party_id, parties!inner(id, name, is_active)")
        .in("role", ["buyer", "broker", "transporter"])
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
    rolesResult.error,
    bankAccountsResult.error,
  ].find(Boolean);

  if (firstError) {
    throw new Error("Unable to load sale reference data.");
  }

  const partiesByRole = new Map<string, SaleReferenceOption[]>();

  for (const role of rolesResult.data ?? []) {
    const party = role.parties[0];
    if (!party) continue;

    const options = partiesByRole.get(role.role) ?? [];
    options.push({ id: String(party.id), name: party.name });
    partiesByRole.set(role.role, options);
  }

  return {
    bankAccounts: (bankAccountsResult.data ?? []).map((account) => ({
      firmId: String(account.firm_id),
      id: String(account.id),
      name: account.name,
    })),
    brokers: partiesByRole.get("broker") ?? [],
    buyers: partiesByRole.get("buyer") ?? [],
    commodities: (commoditiesResult.data ?? []).map((commodity) => ({
      id: String(commodity.id),
      name: commodity.name,
    })),
    firms: (firmsResult.data ?? []).map((firm) => ({
      id: String(firm.id),
      name: firm.name,
    })),
    transporters: partiesByRole.get("transporter") ?? [],
  };
}
