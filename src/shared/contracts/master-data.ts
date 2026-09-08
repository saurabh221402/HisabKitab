export type PartyRole = "broker" | "buyer" | "seller" | "transporter";

export type PartySummary = Readonly<{
  address: string | null;
  gstin: string | null;
  id: string;
  mobile: string | null;
  name: string;
  roles: readonly PartyRole[];
}>;

export type CommoditySummary = Readonly<{
  id: string;
  localName: string | null;
  name: string;
}>;

export type MasterDataOverview = Readonly<{
  commodities: readonly CommoditySummary[];
  parties: readonly PartySummary[];
}>;

export type MasterMutationState = Readonly<{
  error: string | null;
  success: string | null;
}>;
