export type SaleReferenceOption = Readonly<{
  id: string;
  name: string;
}>;

export type SaleBankAccountOption = SaleReferenceOption &
  Readonly<{ firmId: string }>;

export type SaleReferenceData = Readonly<{
  bankAccounts: readonly SaleBankAccountOption[];
  brokers: readonly SaleReferenceOption[];
  buyers: readonly SaleReferenceOption[];
  commodities: readonly SaleReferenceOption[];
  firms: readonly SaleReferenceOption[];
  transporters: readonly SaleReferenceOption[];
}>;

export type SaleReceipt = Readonly<{
  amountRupees: string;
  bankAccountId: string;
  paymentMode: "bank" | "cash";
}>;

export type PostSaleInput = Readonly<{
  bagCount: string;
  brokerageRatePerQuintalRupees: string;
  brokerId: string;
  businessDate: string;
  buyerDeductionReason: string;
  buyerDeductionRupees: string;
  buyerId: string;
  commodityId: string;
  firmId: string;
  idempotencyKey: string;
  kantaNumber: string;
  ratePerQuintalRupees: string;
  receipts: readonly SaleReceipt[];
  remark: string;
  transportRatePerQuintalRupees: string;
  transporterId: string;
  vehicleNumber: string;
  weightKg: string;
}>;

export type PostSaleResult =
  | Readonly<{ error: null; saleId: string }>
  | Readonly<{ error: string; saleId: null }>;

export type SaleDetails = Readonly<{
  amountReceived: string;
  bagCount: string | null;
  brokerageAmount: string;
  brokerageRatePerQuintal: string;
  brokerName: string | null;
  businessDate: string;
  buyerDeduction: string;
  buyerDeductionReason: string | null;
  buyerName: string;
  commodityName: string;
  finalReceivable: string;
  firmName: string;
  grossAmount: string;
  id: string;
  kantaNumber: string | null;
  pendingBalance: string;
  ratePerQuintal: string;
  receipts: readonly Readonly<{
    amount: string;
    mode: "bank" | "cash";
    receiptDate: string;
  }>[];
  status: "draft" | "posted" | "reversed";
  transportAmount: string;
  transportRatePerQuintal: string;
  transporterName: string | null;
  vehicleNumber: string | null;
  weightKg: string;
}>;
