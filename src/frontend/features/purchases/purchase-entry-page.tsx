import Link from "next/link";

import { AppShell } from "@/frontend/components/app-shell";
import { PurchaseEntryForm } from "@/frontend/features/purchases/purchase-entry-form";
import type { PurchaseReferenceData } from "@/shared/contracts/purchases";

export function PurchaseEntryPage({
  defaultBusinessDate,
  referenceData,
}: Readonly<{
  defaultBusinessDate: string;
  referenceData: PurchaseReferenceData;
}>) {
  return (
    <AppShell currentSection="purchases">
      <div className="mx-auto max-w-[92rem]">
        <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <div className="text-ink-subtle flex items-center gap-1.5 text-xs">
              <Link className="hover:text-brand" href="/">Overview</Link>
              <span aria-hidden="true">/</span>
              <span>Purchases</span>
            </div>
            <h1 className="text-ink mt-2 text-3xl font-semibold tracking-[-0.035em]">New purchase</h1>
            <p className="text-ink-muted mt-1.5 text-sm">खरीद पर्चा · Weight, rate, deduction and payment in one place.</p>
          </div>
          <div className="text-ink-subtle text-xs sm:text-right">
            <p>Autosaves on this device</p>
            <p className="mt-1">Whole kg · Whole ₹ rate · Exact paise</p>
          </div>
        </div>
        <PurchaseEntryForm
          defaultBusinessDate={defaultBusinessDate}
          referenceData={referenceData}
        />
      </div>
    </AppShell>
  );
}
