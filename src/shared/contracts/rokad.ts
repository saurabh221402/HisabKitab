export type RokadReferenceOption = Readonly<{
  id: string;
  name: string;
}>;

export type RokadMovement = Readonly<{
  amount: string;
  createdAt: string;
  direction: "in" | "out";
  firmName: string;
  id: string;
  partyName: string;
  remark: string | null;
  sourceLabel: string;
  sourceUrl: string | null;
}>;

export type RokadDay = Readonly<{
  businessDate: string;
  cashIn: string;
  cashOut: string;
  closingBalance: string;
  openingBalance: string;
  openingConfigured: boolean;
  openingDate: string | null;
  movements: readonly RokadMovement[];
}>;

export type RokadReferenceData = Readonly<{
  firms: readonly RokadReferenceOption[];
  parties: readonly RokadReferenceOption[];
}>;

export type CashEntryMutationState = Readonly<{
  error: string | null;
  success: string | null;
}>;
