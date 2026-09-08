import type { Metadata } from "next";

import { getPartyPositions } from "@/backend/application/parties/get-party-positions";
import { PartyPositionsPage } from "@/frontend/features/parties/party-positions-page";

export const metadata: Metadata = {
  title: "Party balances",
};

export const dynamic = "force-dynamic";

type PartyRouteProps = Readonly<{
  searchParams: Promise<{ firm?: string; role?: string; search?: string }>;
}>;

export default async function PartyRoute({ searchParams }: PartyRouteProps) {
  const requestedFilters = await searchParams;
  const filters = {
    firmId: requestedFilters.firm ?? "",
    role: ["seller", "buyer", "broker", "transporter"].includes(requestedFilters.role ?? "")
      ? requestedFilters.role ?? ""
      : "",
    search: requestedFilters.search?.slice(0, 100) ?? "",
  };
  const report = await getPartyPositions({
    firmId: filters.firmId || null,
    role: filters.role || null,
    search: filters.search || null,
  });

  return <PartyPositionsPage filters={filters} report={report} />;
}
