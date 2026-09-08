"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { postPurchaseAction } from "@/app/purchases/new/actions";
import {
  calculatePurchase,
  type PurchaseLineInput,
} from "@/domain/purchases/calculate-purchase";
import {
  CashIcon,
  PlusIcon,
  PurchaseIcon,
  WeightIcon,
} from "@/frontend/components/icons";
import { formatIndianCurrencyFromPaise } from "@/frontend/lib/format-money";
import { formatQuintalsFromKilograms } from "@/frontend/lib/format-weight";
import type { PurchaseReferenceData } from "@/shared/contracts/purchases";

type EditableLine = PurchaseLineInput &
  Readonly<{
    deductionReason: string;
    localId: number;
  }>;

type PurchaseDraft = Readonly<{
  bankAccountId: string;
  businessDate: string;
  emptyWeightKg: string;
  firmId: string;
  kantaNumber: string;
  lines: readonly EditableLine[];
  loadedWeightKg: string;
  paidRupees: string;
  paymentMode: "bank" | "cash";
  purchaseDeductionRupees: string;
  remark: string;
  sellerId: string;
  vehicleNumber: string;
}>;

function createInitialDraft(
  referenceData: PurchaseReferenceData,
  defaultBusinessDate: string,
): PurchaseDraft {
  const rice =
    referenceData.commodities.find((commodity) => commodity.name === "Rice") ??
    referenceData.commodities[0];
  const saiTraders =
    referenceData.firms.find((firm) => firm.name === "Sai Traders") ??
    referenceData.firms[0];

  return {
    bankAccountId: "",
    businessDate: defaultBusinessDate,
    emptyWeightKg: "",
    firmId: saiTraders?.id ?? "",
    kantaNumber: "",
    lines: rice
      ? [
          {
            commodityId: rice.id,
            commodityName: rice.name,
            deductionReason: "",
            deductionRupees: "0",
            localId: 1,
            ratePerQuintalRupees: "",
            weightKg: "0",
          },
        ]
      : [],
    loadedWeightKg: "",
    paidRupees: "0",
    paymentMode: "cash",
    purchaseDeductionRupees: "0",
    remark: "",
    sellerId: "",
    vehicleNumber: "",
  };
}

function createExampleDraft(referenceData: PurchaseReferenceData): PurchaseDraft {
  const rice =
    referenceData.commodities.find((commodity) => commodity.name === "Rice") ??
    referenceData.commodities[0];
  const wheat =
    referenceData.commodities.find((commodity) => commodity.name === "Wheat") ??
    referenceData.commodities[1] ??
    rice;
  const saiTraders =
    referenceData.firms.find((firm) => firm.name === "Sai Traders") ??
    referenceData.firms[0];

  return {
    bankAccountId: "",
    businessDate: "2026-09-07",
    emptyWeightKg: "8500",
    firmId: saiTraders?.id ?? "",
    kantaNumber: "KT-45821",
    lines:
      rice && wheat
        ? [
            {
              commodityId: rice.id,
              commodityName: rice.name,
              deductionReason: "Quality",
              deductionRupees: "2000",
              localId: 1,
              ratePerQuintalRupees: "4500",
              weightKg: "6200",
            },
            {
              commodityId: wheat.id,
              commodityName: wheat.name,
              deductionReason: "Quality",
              deductionRupees: "1000",
              localId: 2,
              ratePerQuintalRupees: "2700",
              weightKg: "3800",
            },
          ]
        : [],
    loadedWeightKg: "18500",
    paidRupees: "200000",
    paymentMode: "cash",
    purchaseDeductionRupees: "5500",
    remark: "Kanta, plastic sack, Hamali and other seller-borne deductions combined.",
    sellerId: "",
    vehicleNumber: "UP 14 AB 1234",
  };
}

const inputClassName =
  "border-line bg-surface-raised text-ink placeholder:text-ink-subtle/65 focus:border-brand min-h-11 w-full rounded-xl border px-3.5 text-sm outline-none transition-colors";
const labelClassName = "text-ink-muted mb-1.5 block text-xs font-semibold";
const draftStorageKey = "hisabkitab.purchase-draft.v1";

function readPurchaseDraft(referenceData: PurchaseReferenceData): PurchaseDraft | null {
  try {
    const savedDraft = localStorage.getItem(draftStorageKey);

    if (!savedDraft) return null;

    const parsedDraft = JSON.parse(savedDraft) as Partial<PurchaseDraft>;
    const validFirmIds = new Set(referenceData.firms.map((firm) => firm.id));
    const validSellerIds = new Set(referenceData.sellers.map((seller) => seller.id));
    const validCommodityIds = new Set(
      referenceData.commodities.map((commodity) => commodity.id),
    );
    const validBankAccountIds = new Set(
      referenceData.bankAccounts
        .filter((account) => account.firmId === parsedDraft.firmId)
        .map((account) => account.id),
    );
    const hasValidStrings = [
      parsedDraft.businessDate,
      parsedDraft.emptyWeightKg,
      parsedDraft.firmId,
      parsedDraft.kantaNumber,
      parsedDraft.loadedWeightKg,
      parsedDraft.paidRupees,
      parsedDraft.purchaseDeductionRupees,
      parsedDraft.remark,
      parsedDraft.sellerId,
      parsedDraft.vehicleNumber,
    ].every((value) => typeof value === "string");
    const linesAreValid =
      Array.isArray(parsedDraft.lines) &&
      parsedDraft.lines.length > 0 &&
      parsedDraft.lines.every(
        (line) =>
          typeof line === "object" &&
          line !== null &&
          typeof line.localId === "number" &&
          typeof line.commodityId === "string" &&
          validCommodityIds.has(line.commodityId) &&
          typeof line.commodityName === "string" &&
          typeof line.deductionReason === "string" &&
          typeof line.deductionRupees === "string" &&
          typeof line.ratePerQuintalRupees === "string" &&
          typeof line.weightKg === "string",
      );

    if (
      !hasValidStrings ||
      !linesAreValid ||
      !parsedDraft.firmId ||
      !validFirmIds.has(parsedDraft.firmId) ||
      typeof parsedDraft.sellerId !== "string" ||
      (parsedDraft.sellerId !== "" && !validSellerIds.has(parsedDraft.sellerId)) ||
      typeof parsedDraft.bankAccountId !== "string" ||
      (parsedDraft.bankAccountId !== "" &&
        !validBankAccountIds.has(parsedDraft.bankAccountId)) ||
      (parsedDraft.paymentMode !== "cash" && parsedDraft.paymentMode !== "bank")
    ) {
      localStorage.removeItem(draftStorageKey);
      return null;
    }

    return parsedDraft as PurchaseDraft;
  } catch {
    localStorage.removeItem(draftStorageKey);
    return null;
  }
}

function calculateResidualWeight(
  loadedWeightKg: string,
  emptyWeightKg: string,
  lines: readonly EditableLine[],
): string {
  if (!/^\d+$/.test(loadedWeightKg) || !/^\d+$/.test(emptyWeightKg)) {
    return "0";
  }

  const netWeight = BigInt(loadedWeightKg) - BigInt(emptyWeightKg);
  const allocatedBeforeResidual = lines.slice(0, -1).reduce((total, line) => {
    return /^\d+$/.test(line.weightKg) ? total + BigInt(line.weightKg) : total;
  }, 0n);
  const residual = netWeight - allocatedBeforeResidual;

  return residual > 0n ? residual.toString() : "0";
}

export function PurchaseEntryForm({
  defaultBusinessDate,
  referenceData,
}: Readonly<{
  defaultBusinessDate: string;
  referenceData: PurchaseReferenceData;
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
    const savedDraft = readPurchaseDraft(referenceData);

    if (!savedDraft) return;

    const restoreFrame = window.requestAnimationFrame(() => {
      setDraft(savedDraft);
      setDraftStatus("Restored from this device");
      setHasDeviceDraft(true);
    });

    return () => window.cancelAnimationFrame(restoreFrame);
  }, [referenceData]);

  const linesWithResidual = useMemo(() => {
    const residualIndex = draft.lines.length - 1;
    return draft.lines.map((line, index) =>
      index === residualIndex
        ? {
            ...line,
            weightKg: calculateResidualWeight(
              draft.loadedWeightKg,
              draft.emptyWeightKg,
              draft.lines,
            ),
          }
        : line,
    );
  }, [draft.emptyWeightKg, draft.lines, draft.loadedWeightKg]);

  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const saveTimer = window.setTimeout(() => {
      localStorage.setItem(
        draftStorageKey,
        JSON.stringify({ ...draft, lines: linesWithResidual }),
      );
      setDraftStatus("Autosaved on this device");
      setHasDeviceDraft(true);
      setHasUnsavedChanges(false);
    }, 600);

    return () => window.clearTimeout(saveTimer);
  }, [draft, hasUnsavedChanges, linesWithResidual]);

  const calculationState = useMemo(() => {
    try {
      return {
        calculation: calculatePurchase({
          emptyWeightKg: draft.emptyWeightKg,
          lines: linesWithResidual,
          loadedWeightKg: draft.loadedWeightKg,
          paidRupees: draft.paidRupees || "0",
          purchaseDeductionRupees: draft.purchaseDeductionRupees || "0",
        }),
        error: null,
      } as const;
    } catch (error) {
      return {
        calculation: null,
        error:
          error instanceof Error
            ? error.message
            : "Check the purchase values.",
      } as const;
    }
  }, [draft, linesWithResidual]);

  const updateDraft = <Key extends keyof PurchaseDraft>(
    key: Key,
    value: PurchaseDraft[Key],
  ) => {
    setDraft((currentDraft) => {
      const nextDraft = { ...currentDraft, [key]: value };

      return key === "firmId" || (key === "paymentMode" && value === "cash")
        ? { ...nextDraft, bankAccountId: "" }
        : nextDraft;
    });
    setDraftStatus("Saving on this device…");
    setHasUnsavedChanges(true);
  };

  const updateLine = (
    localId: number,
    key: keyof Pick<
      EditableLine,
      | "commodityId"
      | "deductionReason"
      | "deductionRupees"
      | "ratePerQuintalRupees"
      | "weightKg"
    >,
    value: string,
  ) => {
    const nextLines = draft.lines.map((line) => {
      if (line.localId !== localId) return line;

      const commodityName =
        key === "commodityId"
          ? referenceData.commodities.find((commodity) => commodity.id === value)
              ?.name ?? line.commodityName
          : line.commodityName;

      return { ...line, [key]: value, commodityName };
    });
    updateDraft("lines", nextLines);
  };

  const saveOnDevice = () => {
    const serializableDraft = { ...draft, lines: linesWithResidual };
    localStorage.setItem(draftStorageKey, JSON.stringify(serializableDraft));
    setDraftStatus("Saved on this device");
    setHasDeviceDraft(true);
    setHasUnsavedChanges(false);
  };

  const loadValidatedExample = () => {
    setDraft(createExampleDraft(referenceData));
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

  const submitPurchase = () => {
    if (!calculationState.calculation) return;

    setPostError(null);
    startPosting(async () => {
      const result = await postPurchaseAction({
        bankAccountId: draft.bankAccountId,
        businessDate: draft.businessDate,
        emptyWeightKg: draft.emptyWeightKg,
        firmId: draft.firmId,
        idempotencyKey,
        kantaNumber: draft.kantaNumber,
        lines: linesWithResidual.map((line, index) => ({
          commodityId: line.commodityId,
          commodityName: line.commodityName,
          deductionReason: line.deductionReason,
          deductionRupees: line.deductionRupees || "0",
          isResidual: index === linesWithResidual.length - 1,
          ratePerQuintalRupees: line.ratePerQuintalRupees,
          weightKg: line.weightKg,
        })),
        loadedWeightKg: draft.loadedWeightKg,
        paidRupees: draft.paidRupees || "0",
        paymentMode: draft.paymentMode,
        purchaseDeductionRupees: draft.purchaseDeductionRupees || "0",
        remark: draft.remark,
        sellerId: draft.sellerId,
        vehicleNumber: draft.vehicleNumber,
      });

      if (result.error) {
        setPostError(result.error);
        return;
      }

      localStorage.removeItem(draftStorageKey);
      router.push(`/purchases/${result.purchaseId}`);
    });
  };

  const calculation = calculationState.calculation;
  const netWeightKg =
    /^\d+$/.test(draft.loadedWeightKg) && /^\d+$/.test(draft.emptyWeightKg)
      ? BigInt(draft.loadedWeightKg) - BigInt(draft.emptyWeightKg)
      : 0n;

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        submitPurchase();
      }}
    >
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-4">
          <section className="border-line bg-surface-raised rounded-card border p-5 shadow-card sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-brand text-xs font-semibold tracking-[0.12em] uppercase">Step 1</p>
                <h2 className="text-ink mt-1.5 text-lg font-semibold">Purchase details</h2>
              </div>
              <span className="bg-warning-soft text-warning rounded-lg px-2.5 py-1 text-xs font-semibold">
                {draft.businessDate < defaultBusinessDate
                  ? "Backdated · Main"
                  : "Open entry"}
              </span>
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
                    <option key={firm.id} value={firm.id}>
                      {firm.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span className={labelClassName}>Purchase date *</span>
                <input
                  className={inputClassName}
                  max={defaultBusinessDate}
                  onChange={(event) => updateDraft("businessDate", event.target.value)}
                  type="date"
                  value={draft.businessDate}
                />
              </label>
              <label>
                <span className={labelClassName}>Seller / बेचने वाला *</span>
                <select
                  className={inputClassName}
                  onChange={(event) => updateDraft("sellerId", event.target.value)}
                  value={draft.sellerId}
                >
                  <option value="">
                    {referenceData.sellers.length === 0
                      ? "Register a seller first"
                      : "Select seller"}
                  </option>
                  {referenceData.sellers.map((seller) => (
                    <option key={seller.id} value={seller.id}>
                      {seller.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span className={labelClassName}>Vehicle number *</span>
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
            <div>
              <p className="text-brand text-xs font-semibold tracking-[0.12em] uppercase">Step 2</p>
              <h2 className="text-ink mt-1.5 text-lg font-semibold">Kanta weight</h2>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <label>
                <span className={labelClassName}>Loaded weight (kg) *</span>
                <input
                  className={`${inputClassName} text-right tabular-nums`}
                  inputMode="numeric"
                  min="1"
                  onChange={(event) => updateDraft("loadedWeightKg", event.target.value)}
                  type="number"
                  value={draft.loadedWeightKg}
                />
              </label>
              <label>
                <span className={labelClassName}>Empty weight (kg) *</span>
                <input
                  className={`${inputClassName} text-right tabular-nums`}
                  inputMode="numeric"
                  min="0"
                  onChange={(event) => updateDraft("emptyWeightKg", event.target.value)}
                  type="number"
                  value={draft.emptyWeightKg}
                />
              </label>
              <div className="bg-brand-soft rounded-xl px-4 py-3">
                <span className="text-brand block text-xs font-semibold">Net commodity weight</span>
                <strong className="text-brand-strong mt-1 block text-right text-lg tabular-nums">
                  {netWeightKg > 0n ? `${netWeightKg.toLocaleString("en-IN")} kg` : "—"}
                </strong>
              </div>
            </div>
          </section>

          <section className="border-line bg-surface-raised rounded-card overflow-hidden border shadow-card">
            <div className="flex items-center justify-between gap-4 px-5 py-5 sm:px-6">
              <div>
                <p className="text-brand text-xs font-semibold tracking-[0.12em] uppercase">Step 3</p>
                <h2 className="text-ink mt-1.5 text-lg font-semibold">Commodity calculation</h2>
              </div>
              <button
                className="border-line text-ink-muted inline-flex min-h-9 items-center gap-1.5 rounded-lg border px-3 text-xs font-semibold"
                onClick={() => {
                  const nextId = Math.max(...draft.lines.map((line) => line.localId)) + 1;
                  const currentResidual = linesWithResidual.at(-1);
                  const retainedLines = draft.lines.map((line, index) =>
                    index === draft.lines.length - 1 && currentResidual
                      ? { ...line, weightKg: currentResidual.weightKg }
                      : line,
                  );
                  updateDraft("lines", [
                    ...retainedLines,
                    {
                      commodityId: referenceData.commodities[0]?.id ?? "",
                      commodityName:
                        referenceData.commodities[0]?.name ?? "Commodity",
                      deductionReason: "",
                      deductionRupees: "0",
                      localId: nextId,
                      ratePerQuintalRupees: "",
                      weightKg: "0",
                    },
                  ]);
                }}
                type="button"
              >
                <PlusIcon className="size-3.5" />
                Add commodity
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[50rem] text-sm">
                <thead className="bg-canvas/70 text-ink-subtle text-left text-[0.68rem] font-semibold tracking-[0.08em] uppercase">
                  <tr>
                    <th className="px-6 py-3" scope="col">Commodity</th>
                    <th className="px-3 py-3 text-right" scope="col">Weight kg</th>
                    <th className="px-3 py-3 text-right" scope="col">Rate / Qt</th>
                    <th className="px-3 py-3 text-right" scope="col">Gross</th>
                    <th className="px-3 py-3 text-right" scope="col">Deduction</th>
                    <th className="px-6 py-3 text-right" scope="col">Final</th>
                  </tr>
                </thead>
                <tbody className="divide-line divide-y">
                  {linesWithResidual.map((line, index) => {
                    const calculatedLine = calculation?.lines[index];
                    const isResidual = index === linesWithResidual.length - 1;

                    return (
                      <tr key={line.localId}>
                        <td className="px-6 py-4">
                          <select
                            aria-label={`Commodity ${index + 1}`}
                            className={`${inputClassName} min-w-36`}
                            onChange={(event) => updateLine(line.localId, "commodityId", event.target.value)}
                            value={line.commodityId}
                          >
                            {referenceData.commodities.map((commodity) => (
                              <option key={commodity.id} value={commodity.id}>
                                {commodity.name}
                              </option>
                            ))}
                          </select>
                          {isResidual ? (
                            <span className="text-brand mt-1.5 block text-[0.68rem] font-semibold">Auto residual weight</span>
                          ) : null}
                        </td>
                        <td className="px-3 py-4">
                          <input
                            aria-label={`${line.commodityName} weight in kg`}
                            className={`${inputClassName} min-w-28 text-right tabular-nums disabled:bg-canvas disabled:text-ink-muted`}
                            disabled={isResidual}
                            inputMode="numeric"
                            min="1"
                            onChange={(event) => updateLine(line.localId, "weightKg", event.target.value)}
                            type="number"
                            value={line.weightKg}
                          />
                          <span className="text-ink-subtle mt-1.5 block text-right text-[0.68rem]">
                            {/^\d+$/.test(line.weightKg) ? formatQuintalsFromKilograms(line.weightKg) : "—"}
                          </span>
                        </td>
                        <td className="px-3 py-4">
                          <input
                            aria-label={`${line.commodityName} rate per quintal`}
                            className={`${inputClassName} min-w-28 text-right tabular-nums`}
                            inputMode="numeric"
                            min="1"
                            onChange={(event) => updateLine(line.localId, "ratePerQuintalRupees", event.target.value)}
                            placeholder="₹ / Qt"
                            step="1"
                            type="number"
                            value={line.ratePerQuintalRupees}
                          />
                        </td>
                        <td className="text-ink-muted px-3 py-4 text-right font-medium tabular-nums">
                          {calculatedLine ? formatIndianCurrencyFromPaise(calculatedLine.grossAmountPaise) : "—"}
                        </td>
                        <td className="px-3 py-4">
                          <input
                            aria-label={`${line.commodityName} deduction`}
                            className={`${inputClassName} min-w-28 text-right tabular-nums`}
                            inputMode="decimal"
                            min="0"
                            onChange={(event) => updateLine(line.localId, "deductionRupees", event.target.value)}
                            step="0.01"
                            type="number"
                            value={line.deductionRupees}
                          />
                          <input
                            aria-label={`${line.commodityName} deduction reason`}
                            className="border-line text-ink placeholder:text-ink-subtle mt-1.5 w-full min-w-28 border-0 border-b bg-transparent px-1 py-1 text-right text-[0.68rem] outline-none"
                            onChange={(event) =>
                              updateLine(
                                line.localId,
                                "deductionReason",
                                event.target.value,
                              )
                            }
                            placeholder="Reason"
                            value={line.deductionReason}
                          />
                        </td>
                        <td className="text-ink px-6 py-4 text-right font-semibold tabular-nums">
                          {calculatedLine ? formatIndianCurrencyFromPaise(calculatedLine.finalAmountPaise) : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          <section className="border-line bg-surface-raised rounded-card border p-5 shadow-card sm:p-6">
            <div>
              <p className="text-brand text-xs font-semibold tracking-[0.12em] uppercase">Step 4</p>
              <h2 className="text-ink mt-1.5 text-lg font-semibold">Deduction & payment</h2>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <label>
                <span className={labelClassName}>Seller deduction total</span>
                <input
                  className={`${inputClassName} text-right tabular-nums`}
                  inputMode="decimal"
                  min="0"
                  onChange={(event) => updateDraft("purchaseDeductionRupees", event.target.value)}
                  step="0.01"
                  type="number"
                  value={draft.purchaseDeductionRupees}
                />
                <span className="text-ink-subtle mt-1 block text-[0.68rem]">Kanta + sack + Hamali + other</span>
              </label>
              <label>
                <span className={labelClassName}>Paid today</span>
                <input
                  className={`${inputClassName} text-right tabular-nums`}
                  inputMode="decimal"
                  min="0"
                  onChange={(event) => updateDraft("paidRupees", event.target.value)}
                  step="0.01"
                  type="number"
                  value={draft.paidRupees}
                />
              </label>
              <fieldset>
                <legend className={labelClassName}>Payment mode</legend>
                <div className="border-line flex min-h-11 rounded-xl border p-1">
                  {(["cash", "bank"] as const).map((mode) => (
                    <button
                      className={`flex-1 rounded-lg text-xs font-semibold capitalize transition-colors ${
                        draft.paymentMode === mode
                          ? "bg-brand-soft text-brand-strong"
                          : "text-ink-subtle"
                      }`}
                      key={mode}
                      onClick={() => updateDraft("paymentMode", mode)}
                      type="button"
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </fieldset>
              {draft.paymentMode === "bank" ? (
                <label>
                  <span className={labelClassName}>Bank account *</span>
                  <select
                    className={inputClassName}
                    onChange={(event) =>
                      updateDraft("bankAccountId", event.target.value)
                    }
                    value={draft.bankAccountId}
                  >
                    <option value="">Select account</option>
                    {referenceData.bankAccounts
                      .filter((account) => account.firmId === draft.firmId)
                      .map((account) => (
                        <option key={account.id} value={account.id}>
                          {account.name}
                        </option>
                      ))}
                  </select>
                </label>
              ) : null}
              <label className="sm:col-span-2 lg:col-span-3">
                <span className={labelClassName}>Remark</span>
                <textarea
                  className={`${inputClassName} min-h-24 resize-y py-3`}
                  onChange={(event) => updateDraft("remark", event.target.value)}
                  value={draft.remark}
                />
              </label>
            </div>
          </section>
        </div>

        <aside className="xl:sticky xl:top-24 xl:self-start">
          <section className="border-line bg-surface-raised rounded-card overflow-hidden border shadow-feature">
            <div className="bg-ink text-surface-raised px-5 py-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-surface-raised/55 text-xs font-semibold tracking-[0.12em] uppercase">Purchase summary</p>
                  <p className="mt-1 text-sm font-medium">
                    {referenceData.sellers.find(
                      (seller) => seller.id === draft.sellerId,
                    )?.name ?? "Seller not selected"}
                  </p>
                </div>
                <span className="bg-surface-raised/10 grid size-10 place-items-center rounded-xl">
                  <PurchaseIcon className="size-5" />
                </span>
              </div>
            </div>
            <div className="space-y-4 p-5">
              <div className="bg-canvas flex items-center justify-between rounded-xl px-4 py-3">
                <span className="text-ink-muted flex items-center gap-2 text-xs">
                  <WeightIcon className="size-4" />
                  Net weight
                </span>
                <strong className="text-ink text-sm tabular-nums">
                  {calculation ? formatQuintalsFromKilograms(calculation.netWeightKg) : "—"}
                </strong>
              </div>

              <dl className="space-y-3 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-ink-muted">Commodity total</dt>
                  <dd className="text-ink font-semibold tabular-nums">
                    {calculation ? formatIndianCurrencyFromPaise(calculation.commodityTotalPaise) : "—"}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-ink-muted">Seller deduction</dt>
                  <dd className="text-warning font-semibold tabular-nums">
                    {calculation ? `−${formatIndianCurrencyFromPaise(calculation.purchaseDeductionPaise)}` : "—"}
                  </dd>
                </div>
                <div className="border-line flex items-center justify-between gap-4 border-t pt-4">
                  <dt className="text-ink font-semibold">Final payable</dt>
                  <dd className="text-brand text-xl font-semibold tracking-[-0.03em] tabular-nums">
                    {calculation ? formatIndianCurrencyFromPaise(calculation.finalPayablePaise) : "—"}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-ink-muted">Paid today</dt>
                  <dd className="text-ink font-semibold tabular-nums">
                    {calculation ? formatIndianCurrencyFromPaise(calculation.amountPaidPaise) : "—"}
                  </dd>
                </div>
              </dl>

              <div className="bg-warning-soft rounded-xl p-4">
                <p className="text-warning text-xs font-semibold">Pending balance / देना है</p>
                <p className="text-warning-strong mt-1 text-2xl font-semibold tracking-[-0.035em] tabular-nums">
                  {calculation ? formatIndianCurrencyFromPaise(calculation.pendingBalancePaise) : "—"}
                </p>
              </div>

              {calculationState.error ? (
                <p className="bg-danger-soft text-danger rounded-xl px-3 py-2.5 text-xs leading-5" role="alert">
                  {calculationState.error}
                </p>
              ) : (
                <p className="bg-brand-soft text-brand-strong rounded-xl px-3 py-2.5 text-xs leading-5">
                  ✓ Kanta weight and commodity weight match exactly.
                </p>
              )}

              {postError ? (
                <p
                  className="bg-danger-soft text-danger rounded-xl px-3 py-2.5 text-xs leading-5"
                  role="alert"
                >
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
                  Load validated purchase example
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
                    !draft.sellerId ||
                    (draft.paymentMode === "bank" && !draft.bankAccountId)
                  }
                  type="submit"
                >
                  <CashIcon className="size-4" />
                  {isPosting ? "Posting…" : "Post purchase"}
                </button>
                <p className="text-ink-subtle mt-2 text-center text-[0.68rem] leading-4">
                  {referenceData.sellers.length === 0
                    ? "Register a seller in Masters before posting."
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
