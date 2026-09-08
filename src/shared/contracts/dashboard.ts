export type DashboardMetric = Readonly<{
  helper: string;
  value: string;
}>;

export type DashboardTransaction = Readonly<{
  amount: string;
  businessDate: string;
  firmName: string;
  id: string;
  partyName: string;
  pendingBalance: string;
  transactionType: "purchase" | "sale";
  url: string;
  weightKg: string;
}>;

export type DashboardOverview = Readonly<{
  businessDate: string;
  buyerOutstanding: DashboardMetric;
  cashOpeningConfigured: boolean;
  displayName: string;
  grossSale: DashboardMetric;
  netPurchase: DashboardMetric;
  recentTransactions: readonly DashboardTransaction[];
  saleWeightKg: string;
  sellerOutstanding: DashboardMetric;
  totalAvailableFunds: string;
  totalWeightKg: string;
}>;
