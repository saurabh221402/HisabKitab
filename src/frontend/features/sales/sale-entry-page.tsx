import Link from "next/link";

import { AppShell } from "@/frontend/components/app-shell";
import { SaleEntryForm } from "@/frontend/features/sales/sale-entry-form";
import type { SaleReferenceData } from "@/shared/contracts/sales";

export function SaleEntryPage({
  defaultBusinessDate,
  referenceData,
}: Readonly<{
  defaultBusinessDate: string;
  referenceData: SaleReferenceData;
}>) {
  return (
    <AppShell currentSection="sales">
      <div className="mx-auto max-w-[92rem]">
        <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <div className="text-ink-subtle flex items-center gap-1.5 text-xs">
              <Link className="hover:text-brand" href="/">Overview</Link>
              <span aria-hidden="true">/</span>
              <span>Sales</span>
            </div>
            <h1 className="text-ink mt-2 text-3xl font-semibold tracking-[-0.035em]">New sale</h1>
            <p className="text-ink-muted mt-1.5 text-sm">बिक्री पर्चा · Buyer receivable, business costs and receipts in one place.</p>
          </div>
          <div className="text-ink-subtle text-xs sm:text-right">
            <p>Autosaves on this device</p>
            <p className="mt-1">Whole kg · Whole ₹ rate · Exact paise</p>
          </div>
        </div>
        <SaleEntryForm
          defaultBusinessDate={defaultBusinessDate}
          referenceData={referenceData}
        />
      </div>
    </AppShell>
  );
}
