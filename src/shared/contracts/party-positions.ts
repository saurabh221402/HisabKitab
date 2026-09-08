export type PartyPosition = Readonly<{
  brokerageOutstanding: string;
  buyerOutstanding: string;
  firmId: string;
  firmName: string;
  lastActivityDate: string | null;
  partyId: string;
  partyName: string;
  roles: readonly string[];
  sellerOutstanding: string;
  transportOutstanding: string;
}>;

export type PartyPositionReport = Readonly<{
  firms: readonly Readonly<{ id: string; name: string }>[];
  positions: readonly PartyPosition[];
  totalBuyerOutstanding: string;
  totalSellerAndCostOutstanding: string;
}>;
