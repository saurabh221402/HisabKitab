"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { postSaleAction } from "@/app/sales/new/actions";
import { calculateSale } from "@/domain/sales/calculate-sale";
import {
  CashIcon,
  PlusIcon,
  SaleIcon,
  WeightIcon,
} from "@/frontend/components/icons";
import { formatIndianCurrencyFromPaise } from "@/frontend/lib/format-money";
import { formatQuintalsFromKilograms } from "@/frontend/lib/format-weight";
import type {
  SaleReceipt,
  SaleReferenceData,
} from "@/shared/contracts/sales";

type EditableReceipt = SaleReceipt & Readonly<{ localId: number }>;

type SaleDraft = Readonly<{
  bagCount: string;
  brokerageRatePerQuintalRupees: string;
  brokerId: string;
  businessDate: string;
  buyerDeductionReason: string;
  buyerDeductionRupees: string;
  buyerId: string;
  commodityId: string;
  firmId: string;
  kantaNumber: string;
  ratePerQuintalRupees: string;
  receipts: readonly EditableReceipt[];
  remark: string;
  transportRatePerQuintalRupees: string;
  transporterId: string;
  vehicleNumber: string;
  weightKg: string;
}>;

function createInitialDraft(
  referenceData: SaleReferenceData,
  defaultBusinessDate: string,
): SaleDraft {
  const rice =
    referenceData.commodities.find((commodity) => commodity.name === "Rice") ??
    referenceData.commodities[0];
  const saiTraders =
    referenceData.firms.find((firm) => firm.name === "Sai Traders") ??
    referenceData.firms[0];

  return {
    bagCount: "",
    brokerageRatePerQuintalRupees: "0",
    brokerId: "",
    businessDate: defaultBusinessDate,
    buyerDeductionReason: "",
    buyerDeductionRupees: "0",
    buyerId: "",
    commodityId: rice?.id ?? "",
    firmId: saiTraders?.id ?? "",
    kantaNumber: "",
    ratePerQuintalRupees: "",
    receipts: [],
    remark: "",
    transportRatePerQuintalRupees: "0",
    transporterId: "",
    vehicleNumber: "",
    weightKg: "",
  };
}

function createExampleDraft(
  referenceData: SaleReferenceData,
  defaultBusinessDate: string,
): SaleDraft {
  return {
    ...createInitialDraft(referenceData, defaultBusinessDate),
    bagCount: "300",
    buyerDeductionReason: "Quality",
    buyerDeductionRupees: "3000",
    ratePerQuintalRupees: "3000",
    weightKg: "30000",
  };
}

const inputClassName =
  "border-line bg-surface-raised text-ink placeholder:text-ink-subtle/65 focus:border-brand min-h-11 w-full rounded-xl border px-3.5 text-sm outline-none transition-colors";
const labelClassName = "text-ink-muted mb-1.5 block text-xs font-semibold";
const draftStorageKey = "hisabkitab.sale-draft.v1";

function readSaleDraft(referenceData: SaleReferenceData): SaleDraft | null {
  try {
    const savedDraft = localStorage.getItem(draftStorageKey);

    if (!savedDraft) return null;

    const parsedDraft = JSON.parse(savedDraft) as Partial<SaleDraft>;
    const validFirmIds = new Set(referenceData.firms.map((firm) => firm.id));
    const validBuyerIds = new Set(referenceData.buyers.map((buyer) => buyer.id));
    const validCommodityIds = new Set(
      referenceData.commodities.map((commodity) => commodity.id),
    );
    const validBrokerIds = new Set(referenceData.brokers.map((broker) => broker.id));
    const validTransporterIds = new Set(
      referenceData.transporters.map((transporter) => transporter.id),
    );
    const validBankAccountIds = new Set(
      referenceData.bankAccounts
        .filter((account) => account.firmId === parsedDraft.firmId)
        .map((account) => account.id),
    );
    const hasValidStrings = [
      parsedDraft.bagCount,
      parsedDraft.brokerageRatePerQuintalRupees,
      parsedDraft.brokerId,
      parsedDraft.businessDate,
      parsedDraft.buyerDeductionReason,
      parsedDraft.buyerDeductionRupees,
      parsedDraft.buyerId,
      parsedDraft.commodityId,
      parsedDraft.firmId,
      parsedDraft.kantaNumber,
      parsedDraft.ratePerQuintalRupees,
      parsedDraft.remark,
      parsedDraft.transportRatePerQuintalRupees,
      parsedDraft.transporterId,
      parsedDraft.vehicleNumber,
      parsedDraft.weightKg,
    ].every((value) => typeof value === "string");
    const receiptsAreValid =
      Array.isArray(parsedDraft.receipts) &&
      parsedDraft.receipts.every(
        (receipt) =>
          typeof receipt === "object" &&
          receipt !== null &&
          typeof receipt.localId === "number" &&
          typeof receipt.amountRupees === "string" &&
          typeof receipt.bankAccountId === "string" &&
          (receipt.paymentMode === "cash" || receipt.paymentMode === "bank") &&
          (receipt.bankAccountId === "" ||
            validBankAccountIds.has(receipt.bankAccountId)),
      );

    if (
      !hasValidStrings ||
      !receiptsAreValid ||
      !parsedDraft.firmId ||
      !validFirmIds.has(parsedDraft.firmId) ||
      !parsedDraft.commodityId ||
      !validCommodityIds.has(parsedDraft.commodityId) ||
      typeof parsedDraft.buyerId !== "string" ||
      (parsedDraft.buyerId !== "" && !validBuyerIds.has(parsedDraft.buyerId)) ||
      typeof parsedDraft.brokerId !== "string" ||
      (parsedDraft.brokerId !== "" && !validBrokerIds.has(parsedDraft.brokerId)) ||
      typeof parsedDraft.transporterId !== "string" ||
      (parsedDraft.transporterId !== "" &&
        !validTransporterIds.has(parsedDraft.transporterId))
    ) {
      localStorage.removeItem(draftStorageKey);
      return null;
    }

    return parsedDraft as SaleDraft;
  } catch {
    localStorage.removeItem(draftStorageKey);
    return null;
  }
}

export function SaleEntryForm({
  defaultBusinessDate,
  referenceData,
}: Readonly<{
  defaultBusinessDate: string;
  referenceData: SaleReferenceData;
}>) {
  const router = useRouter();
  const [draft, setDraft] = useState(() =>
    createInitialDraft(referenceData, defaultBusinessDate),
  );
  const [draftStatus, setDraftStatus] = useState("Unsaved changes");
  const [hasDeviceDraft, setHasDeviceDraft] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [postError, setPostError] = useState<string | null>(null);
  const [isPosting, startPosting] = useTransition();
  const [idempotencyKey] = useState(() => crypto.randomUUID());

  useEffect(() => {
    const savedDraft = readSaleDraft(referenceData);

    if (!savedDraft) return;

    const restoreFrame = window.requestAnimationFrame(() => {
      setDraft(savedDraft);
      setDraftStatus("Restored from this device");
      setHasDeviceDraft(true);
    });

    return () => window.cancelAnimationFrame(restoreFrame);
  }, [referenceData]);

  const calculationState = useMemo(() => {
    try {
      return {
        calculation: calculateSale({
          brokerageRatePerQuintalRupees:
            draft.brokerageRatePerQuintalRupees || "0",
          buyerDeductionRupees: draft.buyerDeductionRupees || "0",
          ratePerQuintalRupees: draft.ratePerQuintalRupees,
          receipts: draft.receipts,
          transportRatePerQuintalRupees:
            draft.transportRatePerQuintalRupees || "0",
          weightKg: draft.weightKg,
        }),
        error: null,
      } as const;
    } catch (error) {
      return {
        calculation: null,
        error:
          error instanceof Error ? error.message : "Check the sale values.",
      } as const;
    }
  }, [draft]);

  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const saveTimer = window.setTimeout(() => {
      localStorage.setItem(draftStorageKey, JSON.stringify(draft));
      setDraftStatus("Autosaved on this device");
      setHasDeviceDraft(true);
      setHasUnsavedChanges(false);
    }, 600);

    return () => window.clearTimeout(saveTimer);
  }, [draft, hasUnsavedChanges]);

  const updateDraft = <Key extends keyof SaleDraft>(
    key: Key,
    value: SaleDraft[Key],
  ) => {
    setDraft((currentDraft) => {
      const nextDraft = { ...currentDraft, [key]: value };

      if (key === "firmId") {
        return {
          ...nextDraft,
          receipts: currentDraft.receipts.map((receipt) => ({
            ...receipt,
            bankAccountId: "",
          })),
        };
      }

      if (key === "brokerId" && value === "") {
        return { ...nextDraft, brokerageRatePerQuintalRupees: "0" };
      }

      if (key === "transporterId" && value === "") {
        return { ...nextDraft, transportRatePerQuintalRupees: "0" };
      }

      return nextDraft;
    });
    setDraftStatus("Saving on this device…");
    setHasUnsavedChanges(true);
  };

  const updateReceipt = (
    localId: number,
    key: keyof Pick<EditableReceipt, "amountRupees" | "bankAccountId" | "paymentMode">,
    value: string,
  ) => {
    updateDraft(
      "receipts",
      draft.receipts.map((receipt) =>
        receipt.localId === localId
          ? {
              ...receipt,
              [key]: value,
              ...(key === "paymentMode" && value === "cash"
                ? { bankAccountId: "" }
                : {}),
            }
          : receipt,
      ) as readonly EditableReceipt[],
    );
  };

  const saveOnDevice = () => {
    localStorage.setItem(draftStorageKey, JSON.stringify(draft));
    setDraftStatus("Saved on this device");
    setHasDeviceDraft(true);
    setHasUnsavedChanges(false);
  };

  const loadValidatedExample = () => {
    setDraft(createExampleDraft(referenceData, defaultBusinessDate));
    setDraftStatus("Saving validated example…");
    setHasUnsavedChanges(true);
    setPostError(null);
  };

  const discardDeviceDraft = () => {
    localStorage.removeItem(draftStorageKey);
    setDraft(createInitialDraft(referenceData, defaultBusinessDate));
    setDraftStatus("Saved draft cleared");
    setHasDeviceDraft(false);
    setHasUnsavedChanges(false);
    setPostError(null);
  };

  const submitSale = () => {
    if (!calculationState.calculation) return;

    setPostError(null);
    startPosting(async () => {
      const result = await postSaleAction({
        bagCount: draft.bagCount,
        brokerageRatePerQuintalRupees:
          draft.brokerageRatePerQuintalRupees || "0",
        brokerId: draft.brokerId,
        businessDate: draft.businessDate,
        buyerDeductionReason: draft.buyerDeductionReason,
        buyerDeductionRupees: draft.buyerDeductionRupees || "0",
        buyerId: draft.buyerId,
        commodityId: draft.commodityId,
        firmId: draft.firmId,
        idempotencyKey,
        kantaNumber: draft.kantaNumber,
        ratePerQuintalRupees: draft.ratePerQuintalRupees,
        receipts: draft.receipts.map((receipt) => ({
          amountRupees: receipt.amountRupees,
          bankAccountId: receipt.bankAccountId,
          paymentMode: receipt.paymentMode,
        })),
        remark: draft.remark,
        transportRatePerQuintalRupees:
          draft.transportRatePerQuintalRupees || "0",
        transporterId: draft.transporterId,
        vehicleNumber: draft.vehicleNumber,
        weightKg: draft.weightKg,
      });

      if (result.error) {
        setPostError(result.error);
        return;
      }

      localStorage.removeItem(draftStorageKey);
      router.push(`/sales/${result.saleId}`);
    });
  };

  const calculation = calculationState.calculation;
  const availableBankAccounts = referenceData.bankAccounts.filter(
    (account) => account.firmId === draft.firmId,
  );

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        submitSale();
      }}
    >
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-4">
          <section className="border-line bg-surface-raised rounded-card border p-5 shadow-card sm:p-6">
            <div>
              <p className="text-brand text-xs font-semibold tracking-[0.12em] uppercase">Step 1</p>
              <h2 className="text-ink mt-1.5 text-lg font-semibold">Sale details</h2>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <label>
                <span className={labelClassName}>Business firm *</span>
                <select
                  className={inputClassName}
                  onChange={(event) => updateDraft("firmId", event.target.value)}
                  value={draft.firmId}
                >
                  {referenceData.firms.map((firm) => (
                    <option key={firm.id} value={firm.id}>{firm.name}</option>
                  ))}
                </select>
              </label>
              <label>
                <span className={labelClassName}>Sale date *</span>
                <input
                  className={inputClassName}
                  max={defaultBusinessDate}
                  onChange={(event) => updateDraft("businessDate", event.target.value)}
                  type="date"
                  value={draft.businessDate}
                />
              </label>
              <label>
                <span className={labelClassName}>Buyer / खरीदने वाला *</span>
                <select
                  className={inputClassName}
                  onChange={(event) => updateDraft("buyerId", event.target.value)}
                  value={draft.buyerId}
                >
                  <option value="">Select buyer</option>
                  {referenceData.buyers.map((buyer) => (
                    <option key={buyer.id} value={buyer.id}>{buyer.name}</option>
                  ))}
                </select>
              </label>
              <label>
                <span className={labelClassName}>Commodity *</span>
                <select
                  className={inputClassName}
                  onChange={(event) => updateDraft("commodityId", event.target.value)}
                  value={draft.commodityId}
                >
                  {referenceData.commodities.map((commodity) => (
                    <option key={commodity.id} value={commodity.id}>{commodity.name}</option>
                  ))}
                </select>
              </label>
              <label>
                <span className={labelClassName}>Bags / बोरी</span>
                <input
                  className={`${inputClassName} text-right tabular-nums`}
                  inputMode="numeric"
                  min="1"
                  onChange={(event) => updateDraft("bagCount", event.target.value)}
                  placeholder="Optional"
                  type="number"
                  value={draft.bagCount}
                />
                <span className="text-ink-subtle mt-1 block text-[0.68rem]">Informational only</span>
              </label>
              <label>
                <span className={labelClassName}>Actual weight (kg) *</span>
                <input
                  className={`${inputClassName} text-right tabular-nums`}
                  inputMode="numeric"
                  min="1"
                  onChange={(event) => updateDraft("weightKg", event.target.value)}
                  type="number"
                  value={draft.weightKg}
                />
                <span className="text-brand mt-1 block text-right text-[0.68rem] font-semibold">
                  {/^\d+$/.test(draft.weightKg)
                    ? formatQuintalsFromKilograms(draft.weightKg)
                    : "—"}
                </span>
              </label>
              <label>
                <span className={labelClassName}>Sale rate (₹ / Qt) *</span>
                <input
                  className={`${inputClassName} text-right tabular-nums`}
                  inputMode="numeric"
                  min="1"
                  onChange={(event) => updateDraft("ratePerQuintalRupees", event.target.value)}
                  step="1"
                  type="number"
                  value={draft.ratePerQuintalRupees}
                />
              </label>
            </div>
          </section>

          <section className="border-line bg-surface-raised rounded-card border p-5 shadow-card sm:p-6">
            <div>
              <p className="text-brand text-xs font-semibold tracking-[0.12em] uppercase">Step 2</p>
              <h2 className="text-ink mt-1.5 text-lg font-semibold">Deduction & business costs</h2>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <label>
                <span className={labelClassName}>Buyer deduction</span>
                <input
                  className={`${inputClassName} text-right tabular-nums`}
                  inputMode="decimal"
                  min="0"
                  onChange={(event) => updateDraft("buyerDeductionRupees", event.target.value)}
                  step="0.01"
                  type="number"
                  value={draft.buyerDeductionRupees}
                />
              </label>
              <label className="sm:col-span-1 lg:col-span-2">
                <span className={labelClassName}>Deduction reason *</span>
                <input
                  className={inputClassName}
                  onChange={(event) => updateDraft("buyerDeductionReason", event.target.value)}
                  placeholder="Moisture, quality, etc."
                  value={draft.buyerDeductionReason}
                />
              </label>
              <label>
                <span className={labelClassName}>Broker</span>
                <select
                  className={inputClassName}
                  onChange={(event) => updateDraft("brokerId", event.target.value)}
                  value={draft.brokerId}
                >
                  <option value="">No broker</option>
                  {referenceData.brokers.map((broker) => (
                    <option key={broker.id} value={broker.id}>{broker.name}</option>
                  ))}
                </select>
              </label>
              <label>
                <span className={labelClassName}>Brokerage rate (₹ / Qt)</span>
                <input
                  className={`${inputClassName} text-right tabular-nums`}
                  inputMode="numeric"
                  min="0"
                  onChange={(event) => updateDraft("brokerageRatePerQuintalRupees", event.target.value)}
                  step="1"
                  type="number"
                  value={draft.brokerageRatePerQuintalRupees}
                />
              </label>
              <div className="bg-canvas rounded-xl px-4 py-3">
                <span className="text-ink-subtle block text-xs">Broker payable</span>
                <strong className="text-ink mt-1 block text-right text-sm tabular-nums">
                  {calculation ? formatIndianCurrencyFromPaise(calculation.brokerageAmountPaise) : "—"}
                </strong>
              </div>
              <label>
                <span className={labelClassName}>Transporter</span>
                <select
                  className={inputClassName}
                  onChange={(event) => updateDraft("transporterId", event.target.value)}
                  value={draft.transporterId}
                >
                  <option value="">No transporter</option>
                  {referenceData.transporters.map((transporter) => (
                    <option key={transporter.id} value={transporter.id}>{transporter.name}</option>
                  ))}
                </select>
              </label>
              <label>
                <span className={labelClassName}>Transport rate (₹ / Qt)</span>
                <input
                  className={`${inputClassName} text-right tabular-nums`}
                  inputMode="numeric"
                  min="0"
                  onChange={(event) => updateDraft("transportRatePerQuintalRupees", event.target.value)}
                  step="1"
                  type="number"
                  value={draft.transportRatePerQuintalRupees}
                />
              </label>
              <div className="bg-canvas rounded-xl px-4 py-3">
                <span className="text-ink-subtle block text-xs">Transport payable</span>
                <strong className="text-ink mt-1 block text-right text-sm tabular-nums">
                  {calculation ? formatIndianCurrencyFromPaise(calculation.transportAmountPaise) : "—"}
                </strong>
              </div>
              <label>
                <span className={labelClassName}>Vehicle number</span>
                <input
                  className={`${inputClassName} uppercase`}
                  onChange={(event) => updateDraft("vehicleNumber", event.target.value)}
                  value={draft.vehicleNumber}
                />
              </label>
              <label>
                <span className={labelClassName}>Kanta number</span>
                <input
                  className={inputClassName}
                  onChange={(event) => updateDraft("kantaNumber", event.target.value)}
                  value={draft.kantaNumber}
                />
              </label>
            </div>
          </section>

          <section className="border-line bg-surface-raised rounded-card border p-5 shadow-card sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-brand text-xs font-semibold tracking-[0.12em] uppercase">Step 3</p>
                <h2 className="text-ink mt-1.5 text-lg font-semibold">Received now</h2>
                <p className="text-ink-subtle mt-1 text-xs">Split between cash and firm bank accounts when needed.</p>
              </div>
              <button
                className="border-line text-ink-muted inline-flex min-h-9 items-center gap-1.5 rounded-lg border px-3 text-xs font-semibold disabled:opacity-45"
                disabled={draft.receipts.length >= 5}
                onClick={() => {
                  const nextId = Math.max(0, ...draft.receipts.map((receipt) => receipt.localId)) + 1;
                  updateDraft("receipts", [
                    ...draft.receipts,
                    { amountRupees: "", bankAccountId: "", localId: nextId, paymentMode: "cash" },
                  ]);
                }}
                type="button"
              >
                <PlusIcon className="size-3.5" />
                Add receipt
              </button>
            </div>

            {draft.receipts.length === 0 ? (
              <div className="bg-canvas text-ink-muted mt-5 rounded-xl px-4 py-4 text-sm">
                No amount received now. The full receivable will remain pending.
              </div>
            ) : (
              <div className="mt-5 space-y-3">
                {draft.receipts.map((receipt, index) => (
                  <div className="border-line grid gap-3 rounded-xl border p-3 sm:grid-cols-[1fr_1fr_1.2fr_auto] sm:items-end" key={receipt.localId}>
                    <label>
                      <span className={labelClassName}>Receipt {index + 1}</span>
                      <input
                        className={`${inputClassName} text-right tabular-nums`}
                        inputMode="decimal"
                        min="0.01"
                        onChange={(event) => updateReceipt(receipt.localId, "amountRupees", event.target.value)}
                        placeholder="₹ amount"
                        step="0.01"
                        type="number"
                        value={receipt.amountRupees}
                      />
                    </label>
                    <label>
                      <span className={labelClassName}>Mode</span>
                      <select
                        className={inputClassName}
                        onChange={(event) => updateReceipt(receipt.localId, "paymentMode", event.target.value)}
                        value={receipt.paymentMode}
                      >
                        <option value="cash">Cash / CR</option>
                        <option value="bank">Bank</option>
                      </select>
                    </label>
                    <label>
                      <span className={labelClassName}>Bank account</span>
                      <select
                        className={inputClassName}
                        disabled={receipt.paymentMode === "cash"}
                        onChange={(event) => updateReceipt(receipt.localId, "bankAccountId", event.target.value)}
                        value={receipt.bankAccountId}
                      >
                        <option value="">{receipt.paymentMode === "cash" ? "Not needed" : "Select account"}</option>
                        {availableBankAccounts.map((account) => (
                          <option key={account.id} value={account.id}>{account.name}</option>
                        ))}
                      </select>
                    </label>
                    <button
                      className="text-danger min-h-11 rounded-lg px-2 text-xs font-semibold"
                      onClick={() => updateDraft("receipts", draft.receipts.filter((item) => item.localId !== receipt.localId))}
                      type="button"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}

            <label className="mt-5 block">
              <span className={labelClassName}>Remark</span>
              <textarea
                className={`${inputClassName} min-h-24 resize-y py-3`}
                onChange={(event) => updateDraft("remark", event.target.value)}
                value={draft.remark}
              />
            </label>
          </section>
        </div>

        <aside className="xl:sticky xl:top-24 xl:self-start">
          <section className="border-line bg-surface-raised rounded-card overflow-hidden border shadow-feature">
            <div className="bg-ink text-surface-raised px-5 py-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-surface-raised/55 text-xs font-semibold tracking-[0.12em] uppercase">Sale summary</p>
                  <p className="mt-1 text-sm font-medium">
                    {referenceData.buyers.find((buyer) => buyer.id === draft.buyerId)?.name ?? "Buyer not selected"}
                  </p>
                </div>
                <span className="bg-surface-raised/10 grid size-10 place-items-center rounded-xl">
                  <SaleIcon className="size-5" />
                </span>
              </div>
            </div>
            <div className="space-y-4 p-5">
              <div className="bg-canvas flex items-center justify-between rounded-xl px-4 py-3">
                <span className="text-ink-muted flex items-center gap-2 text-xs">
                  <WeightIcon className="size-4" />
                  Actual weight
                </span>
                <strong className="text-ink text-sm tabular-nums">
                  {calculation ? formatQuintalsFromKilograms(calculation.weightKg) : "—"}
                </strong>
              </div>

              <dl className="space-y-3 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-ink-muted">Gross sale</dt>
                  <dd className="text-ink font-semibold tabular-nums">
                    {calculation ? formatIndianCurrencyFromPaise(calculation.grossAmountPaise) : "—"}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-ink-muted">Buyer deduction</dt>
                  <dd className="text-warning font-semibold tabular-nums">
                    {calculation ? `−${formatIndianCurrencyFromPaise(calculation.buyerDeductionPaise)}` : "—"}
                  </dd>
                </div>
                <div className="border-line flex items-center justify-between gap-4 border-t pt-4">
                  <dt className="text-ink font-semibold">Final receivable</dt>
                  <dd className="text-brand text-xl font-semibold tracking-[-0.03em] tabular-nums">
                    {calculation ? formatIndianCurrencyFromPaise(calculation.finalReceivablePaise) : "—"}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-ink-muted">Received now</dt>
                  <dd className="text-ink font-semibold tabular-nums">
                    {calculation ? formatIndianCurrencyFromPaise(calculation.amountReceivedPaise) : "—"}
                  </dd>
                </div>
              </dl>

              <div className="bg-brand-soft rounded-xl p-4">
                <p className="text-brand text-xs font-semibold">Pending balance / लेना है</p>
                <p className="text-brand-strong mt-1 text-2xl font-semibold tracking-[-0.035em] tabular-nums">
                  {calculation ? formatIndianCurrencyFromPaise(calculation.pendingBalancePaise) : "—"}
                </p>
              </div>

              <div className="bg-warning-soft rounded-xl p-3 text-xs leading-5">
                <p className="text-warning-strong font-semibold">Business costs stay separate</p>
                <p className="text-warning mt-1">
                  Brokerage and transport do not reduce the buyer receivable.
                </p>
              </div>

              {calculationState.error ? (
                <p className="bg-danger-soft text-danger rounded-xl px-3 py-2.5 text-xs leading-5" role="alert">
                  {calculationState.error}
                </p>
              ) : null}

              {postError ? (
                <p className="bg-danger-soft text-danger rounded-xl px-3 py-2.5 text-xs leading-5" role="alert">
                  {postError}
                </p>
              ) : null}

              <div className="border-line border-t pt-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-ink-subtle text-xs">{draftStatus}</span>
                  <span className="bg-canvas text-ink-subtle rounded-md px-2 py-1 text-[0.65rem] font-semibold">Not posted</span>
                </div>
                <button
                  className="border-line text-ink hover:border-brand/40 mt-3 min-h-11 w-full rounded-xl border text-sm font-semibold transition-colors"
                  onClick={saveOnDevice}
                  type="button"
                >
                  Save draft on device
                </button>
                <button
                  className="text-brand hover:text-brand-strong mt-1 min-h-9 w-full text-xs font-semibold transition-colors"
                  onClick={loadValidatedExample}
                  type="button"
                >
                  Load validated sale example
                </button>
                {hasDeviceDraft ? (
                  <button
                    className="text-ink-subtle hover:text-danger mt-2 min-h-9 w-full text-xs font-semibold transition-colors"
                    onClick={discardDeviceDraft}
                    type="button"
                  >
                    Discard saved draft
                  </button>
                ) : null}
                <button
                  className="bg-brand text-surface-raised mt-2 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold shadow-sm disabled:cursor-not-allowed disabled:opacity-45"
                  disabled={
                    isPosting ||
                    !calculation ||
                    !draft.firmId ||
                    !draft.buyerId ||
                    !draft.commodityId ||
                    (calculation.buyerDeductionPaise > 0n && !draft.buyerDeductionReason.trim()) ||
                    (Boolean(draft.brokerId) !== (calculation.brokerageRatePerQuintalRupees > 0n)) ||
                    (Boolean(draft.transporterId) !== (calculation.transportRatePerQuintalRupees > 0n)) ||
                    draft.receipts.some((receipt) => receipt.paymentMode === "bank" && !receipt.bankAccountId)
                  }
                  type="submit"
                >
                  <CashIcon className="size-4" />
                  {isPosting ? "Posting…" : "Post sale"}
                </button>
                <p className="text-ink-subtle mt-2 text-center text-[0.68rem] leading-4">
                  {referenceData.buyers.length === 0
                    ? "Register a buyer in Masters before posting."
                    : "Posting is validated again on the server and database."}
                </p>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </form>
  );
}
