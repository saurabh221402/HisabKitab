import Link from "next/link";

import { AppShell } from "@/frontend/components/app-shell";
import { CashIcon, SaleIcon, WeightIcon } from "@/frontend/components/icons";
import { formatIndianCurrency } from "@/frontend/lib/format-money";
import { formatQuintalsFromKilograms } from "@/frontend/lib/format-weight";
import type { SaleDetails } from "@/shared/contracts/sales";

export function SaleDetailsPage({ sale }: Readonly<{ sale: SaleDetails }>) {
  return (
    <AppShell currentSection="sales">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <Link className="text-brand text-xs font-semibold" href="/sales">← Sales</Link>
            <h1 className="text-ink mt-3 text-3xl font-semibold tracking-[-0.035em]">Sale #{sale.id}</h1>
            <p className="text-ink-muted mt-2 text-sm">{sale.buyerName} · {sale.businessDate}</p>
          </div>
          <span className="bg-brand-soft text-brand-strong w-fit rounded-lg px-3 py-1.5 text-xs font-semibold capitalize">
            ✓ {sale.status}
          </span>
        </div>

        <section className="border-line bg-surface-raised rounded-card mt-6 overflow-hidden border shadow-feature">
          <div className="bg-ink text-surface-raised grid gap-5 px-6 py-6 sm:grid-cols-3">
            <div>
              <p className="text-surface-raised/55 text-xs">Final receivable</p>
              <p className="mt-1 text-2xl font-semibold">{formatIndianCurrency(sale.finalReceivable)}</p>
            </div>
            <div>
              <p className="text-surface-raised/55 text-xs">Received</p>
              <p className="mt-1 text-2xl font-semibold">{formatIndianCurrency(sale.amountReceived)}</p>
            </div>
            <div>
              <p className="text-surface-raised/55 text-xs">Pending / लेना है</p>
              <p className="text-accent mt-1 text-2xl font-semibold">{formatIndianCurrency(sale.pendingBalance)}</p>
            </div>
          </div>

          <div className="grid gap-6 p-6 lg:grid-cols-[1fr_18rem]">
            <div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  ["Firm", sale.firmName],
                  ["Commodity", sale.commodityName],
                  ["Actual weight", formatQuintalsFromKilograms(sale.weightKg)],
                  ["Bags", sale.bagCount ?? "—"],
                  ["Rate / Qt", formatIndianCurrency(sale.ratePerQuintal)],
                  ["Vehicle", sale.vehicleNumber ?? "—"],
                  ["Kanta no.", sale.kantaNumber ?? "—"],
                ].map(([label, value]) => (
                  <div className="bg-canvas rounded-xl px-4 py-3" key={label}>
                    <p className="text-ink-subtle text-[0.68rem] font-semibold uppercase">{label}</p>
                    <p className="text-ink mt-1 text-sm font-semibold">{value}</p>
                  </div>
                ))}
              </div>

              <div className="border-line mt-6 overflow-hidden rounded-2xl border">
                <dl className="divide-line divide-y text-sm">
                  <div className="flex items-center justify-between gap-4 px-4 py-3">
                    <dt className="text-ink-muted">Gross sale</dt>
                    <dd className="text-ink font-semibold">{formatIndianCurrency(sale.grossAmount)}</dd>
                  </div>
                  <div className="flex items-start justify-between gap-4 px-4 py-3">
                    <dt className="text-ink-muted">
                      Buyer deduction
                      {sale.buyerDeductionReason ? <span className="text-ink-subtle mt-1 block text-xs">{sale.buyerDeductionReason}</span> : null}
                    </dt>
                    <dd className="text-warning font-semibold">−{formatIndianCurrency(sale.buyerDeduction)}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-4 px-4 py-4">
                    <dt className="text-ink font-semibold">Final buyer receivable</dt>
                    <dd className="text-brand text-lg font-semibold">{formatIndianCurrency(sale.finalReceivable)}</dd>
                  </div>
                </dl>
              </div>
            </div>

            <aside className="space-y-3">
              <div className="bg-brand-soft rounded-xl p-4">
                <WeightIcon className="text-brand size-5" />
                <p className="text-brand mt-3 text-xs font-semibold">Broker payable</p>
                <p className="text-brand-strong mt-1 text-lg font-semibold">{formatIndianCurrency(sale.brokerageAmount)}</p>
                <p className="text-brand mt-1 text-xs">{sale.brokerName ?? "No broker"}{sale.brokerName ? ` · ${formatIndianCurrency(sale.brokerageRatePerQuintal)}/Qt` : ""}</p>
              </div>
              <div className="bg-warning-soft rounded-xl p-4">
                <SaleIcon className="text-warning size-5" />
                <p className="text-warning mt-3 text-xs font-semibold">Transport payable</p>
                <p className="text-warning-strong mt-1 text-lg font-semibold">{formatIndianCurrency(sale.transportAmount)}</p>
                <p className="text-warning mt-1 text-xs">{sale.transporterName ?? "No transporter"}{sale.transporterName ? ` · ${formatIndianCurrency(sale.transportRatePerQuintal)}/Qt` : ""}</p>
              </div>
              <div className="border-line rounded-xl border p-4">
                <CashIcon className="text-ink-subtle size-5" />
                <p className="text-ink mt-3 text-sm font-semibold">Receipts</p>
                {sale.receipts.length === 0 ? (
                  <p className="text-ink-subtle mt-1 text-xs">No receipt recorded</p>
                ) : sale.receipts.map((receipt, index) => (
                  <p className="text-ink-muted mt-1 text-xs capitalize" key={`${receipt.receiptDate}-${index}`}>
                    {receipt.mode} · {formatIndianCurrency(receipt.amount)}
                  </p>
                ))}
              </div>
            </aside>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
