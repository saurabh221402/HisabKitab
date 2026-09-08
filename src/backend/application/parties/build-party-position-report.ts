import {
  paiseToDecimalString,
  rupeesToPaise,
} from "../../../domain/shared/exact-numbers";
import type {
  PartyPosition,
  PartyPositionReport,
} from "../../../shared/contracts/party-positions";

type PartyPositionFilters = Readonly<{
  firmId: string | null;
  role: string | null;
  search: string | null;
}>;

type PartyPositionSource = Readonly<{
  brokerageOutstanding: string;
  buyerOutstanding: string;
  firmId: string;
  lastActivityDate: string | null;
  partyId: string;
  sellerOutstanding: string;
  transportOutstanding: string;
}>;

type PartyRoleSource = Readonly<{
  partyId: string;
  role: string;
}>;

type PartyPositionReportInput = Readonly<{
  filters: PartyPositionFilters;
  firms: readonly Readonly<{ id: string; name: string }>[];
  parties: readonly Readonly<{ id: string; name: string }>[];
  partyRoles: readonly PartyRoleSource[];
  positions: readonly PartyPositionSource[];
}>;

const zeroAmount = "0.00";
const partyNameCollator = new Intl.Collator("en-IN", { sensitivity: "base" });

export function buildPartyPositionReport({
  filters,
  firms,
  parties,
  partyRoles,
  positions: sourcePositions,
}: PartyPositionReportInput): PartyPositionReport {
  const firmNames = new Map(firms.map((firm) => [firm.id, firm.name]));
  const partyNames = new Map(parties.map((party) => [party.id, party.name]));
  const rolesByParty = new Map<string, string[]>();

  for (const partyRole of partyRoles) {
    const roles = rolesByParty.get(partyRole.partyId) ?? [];
    roles.push(partyRole.role);
    rolesByParty.set(partyRole.partyId, roles);
  }

  const positionsWithActivity: PartyPosition[] = sourcePositions.map((position) => ({
    ...position,
    firmName: firmNames.get(position.firmId) ?? "Business firm",
    partyName: partyNames.get(position.partyId) ?? "Party",
    roles: rolesByParty.get(position.partyId) ?? [],
  }));
  const representedPartyIds = new Set(
    positionsWithActivity.map((position) => position.partyId),
  );
  const selectedFirm = filters.firmId
    ? firms.find((firm) => firm.id === filters.firmId)
    : undefined;
  const partiesWithoutActivity: PartyPosition[] = parties
    .filter((party) => !representedPartyIds.has(party.id))
    .map((party) => ({
      brokerageOutstanding: zeroAmount,
      buyerOutstanding: zeroAmount,
      firmId: selectedFirm?.id ?? "",
      firmName: selectedFirm?.name ?? "—",
      lastActivityDate: null,
      partyId: party.id,
      partyName: party.name,
      roles: rolesByParty.get(party.id) ?? [],
      sellerOutstanding: zeroAmount,
      transportOutstanding: zeroAmount,
    }));

  const normalizedSearch = filters.search?.trim().toLocaleLowerCase("en-IN") ?? "";
  const positions = [...positionsWithActivity, ...partiesWithoutActivity]
    .filter((position) =>
      filters.role ? position.roles.includes(filters.role) : true,
    )
    .filter((position) =>
      normalizedSearch
        ? position.partyName.toLocaleLowerCase("en-IN").includes(normalizedSearch)
        : true,
    );

  positions.sort((left, right) => {
    if (left.lastActivityDate && right.lastActivityDate) {
      const dateComparison = right.lastActivityDate.localeCompare(left.lastActivityDate);
      if (dateComparison !== 0) return dateComparison;
    } else if (left.lastActivityDate) {
      return -1;
    } else if (right.lastActivityDate) {
      return 1;
    }

    return partyNameCollator.compare(left.partyName, right.partyName);
  });

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
