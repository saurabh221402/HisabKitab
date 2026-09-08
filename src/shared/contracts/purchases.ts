export type PurchaseReferenceOption = Readonly<{
  id: string;
  name: string;
}>;

export type PurchaseBankAccountOption = PurchaseReferenceOption &
  Readonly<{ firmId: string }>;

export type PurchaseReferenceData = Readonly<{
  bankAccounts: readonly PurchaseBankAccountOption[];
  commodities: readonly PurchaseReferenceOption[];
  firms: readonly PurchaseReferenceOption[];
  sellers: readonly PurchaseReferenceOption[];
}>;

export type PostPurchaseInput = Readonly<{
  businessDate: string;
  emptyWeightKg: string;
  firmId: string;
  idempotencyKey: string;
  kantaNumber: string;
  lines: readonly Readonly<{
    commodityId: string;
    commodityName: string;
    deductionReason: string;
    deductionRupees: string;
    isResidual: boolean;
    ratePerQuintalRupees: string;
    weightKg: string;
  }>[];
  loadedWeightKg: string;
  paidRupees: string;
  paymentMode: "bank" | "cash";
  bankAccountId: string;
  purchaseDeductionRupees: string;
  remark: string;
  sellerId: string;
  vehicleNumber: string;
}>;

export type PostPurchaseResult =
  | Readonly<{ error: null; purchaseId: string }>
  | Readonly<{ error: string; purchaseId: null }>;

export type PurchaseDetails = Readonly<{
  amountPaid: string;
  businessDate: string;
  commodityTotal: string;
  emptyWeightKg: string;
  finalPayable: string;
  firmName: string;
  id: string;
  kantaNumber: string | null;
  lines: readonly Readonly<{
    commodityName: string;
    deduction: string;
    deductionReason: string | null;
    finalAmount: string;
    grossAmount: string;
    ratePerQuintal: string;
    weightKg: string;
  }>[];
  loadedWeightKg: string;
  netWeightKg: string;
  payments: readonly Readonly<{
    amount: string;
    mode: "bank" | "cash";
    paymentDate: string;
  }>[];
  pendingBalance: string;
  sellerDeduction: string;
  sellerName: string;
  status: "draft" | "posted" | "reversed";
  vehicleNumber: string;
}>;
