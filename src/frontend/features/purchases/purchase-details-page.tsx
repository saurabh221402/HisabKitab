import Link from "next/link";

import { AppShell } from "@/frontend/components/app-shell";
import { CashIcon, PurchaseIcon, WeightIcon } from "@/frontend/components/icons";
import { formatIndianCurrency } from "@/frontend/lib/format-money";
import { formatQuintalsFromKilograms } from "@/frontend/lib/format-weight";
import type { PurchaseDetails } from "@/shared/contracts/purchases";

export function PurchaseDetailsPage({ purchase }: Readonly<{ purchase: PurchaseDetails }>) {
  return (
    <AppShell currentSection="purchases">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <Link className="text-brand text-xs font-semibold" href="/purchases/new">← Purchases</Link>
            <h1 className="text-ink mt-3 text-3xl font-semibold tracking-[-0.035em]">Purchase #{purchase.id}</h1>
            <p className="text-ink-muted mt-2 text-sm">{purchase.sellerName} · {purchase.businessDate}</p>
          </div>
          <span className="bg-brand-soft text-brand-strong w-fit rounded-lg px-3 py-1.5 text-xs font-semibold capitalize">
            ✓ {purchase.status}
          </span>
        </div>

        <section className="border-line bg-surface-raised rounded-card mt-6 overflow-hidden border shadow-feature">
          <div className="bg-ink text-surface-raised grid gap-5 px-6 py-6 sm:grid-cols-3">
            <div>
              <p className="text-surface-raised/55 text-xs">Final payable</p>
              <p className="mt-1 text-2xl font-semibold">{formatIndianCurrency(purchase.finalPayable)}</p>
            </div>
            <div>
              <p className="text-surface-raised/55 text-xs">Paid</p>
              <p className="mt-1 text-2xl font-semibold">{formatIndianCurrency(purchase.amountPaid)}</p>
            </div>
            <div>
              <p className="text-surface-raised/55 text-xs">Pending / देना है</p>
              <p className="text-warning-soft mt-1 text-2xl font-semibold">{formatIndianCurrency(purchase.pendingBalance)}</p>
            </div>
          </div>

          <div className="grid gap-6 p-6 lg:grid-cols-[1fr_18rem]">
            <div>
              <div className="grid gap-3 sm:grid-cols-4">
                {[
                  ["Firm", purchase.firmName],
                  ["Vehicle", purchase.vehicleNumber],
                  ["Kanta no.", purchase.kantaNumber ?? "—"],
                  ["Net weight", formatQuintalsFromKilograms(purchase.netWeightKg)],
                ].map(([label, value]) => (
                  <div className="bg-canvas rounded-xl px-4 py-3" key={label}>
                    <p className="text-ink-subtle text-[0.68rem] font-semibold uppercase">{label}</p>
                    <p className="text-ink mt-1 text-sm font-semibold">{value}</p>
                  </div>
                ))}
              </div>

              <div className="border-line mt-6 overflow-x-auto rounded-2xl border">
                <table className="w-full min-w-[42rem] text-left text-sm">
                  <thead className="bg-canvas/75 text-ink-subtle text-[0.68rem] font-semibold uppercase">
                    <tr>
                      <th className="px-4 py-3" scope="col">Commodity</th>
                      <th className="px-4 py-3 text-right" scope="col">Weight</th>
                      <th className="px-4 py-3 text-right" scope="col">Rate / Qt</th>
                      <th className="px-4 py-3 text-right" scope="col">Gross</th>
                      <th className="px-4 py-3 text-right" scope="col">Deduction</th>
                      <th className="px-4 py-3 text-right" scope="col">Final</th>
                    </tr>
                  </thead>
                  <tbody className="divide-line divide-y">
                    {purchase.lines.map((line, index) => (
                      <tr key={`${line.commodityName}-${index}`}>
                        <td className="text-ink px-4 py-4 font-semibold">
                          {line.commodityName}
                          {line.deductionReason ? <span className="text-ink-subtle mt-1 block text-[0.68rem] font-normal">{line.deductionReason}</span> : null}
                        </td>
                        <td className="text-ink-muted px-4 py-4 text-right">{formatQuintalsFromKilograms(line.weightKg)}</td>
                        <td className="text-ink-muted px-4 py-4 text-right">{formatIndianCurrency(line.ratePerQuintal)}</td>
                        <td className="text-ink-muted px-4 py-4 text-right">{formatIndianCurrency(line.grossAmount)}</td>
                        <td className="text-warning px-4 py-4 text-right">−{formatIndianCurrency(line.deduction)}</td>
                        <td className="text-ink px-4 py-4 text-right font-semibold">{formatIndianCurrency(line.finalAmount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <aside className="space-y-3">
              <div className="bg-brand-soft rounded-xl p-4">
                <WeightIcon className="text-brand size-5" />
                <p className="text-brand mt-3 text-xs font-semibold">Commodity total</p>
                <p className="text-brand-strong mt-1 text-lg font-semibold">{formatIndianCurrency(purchase.commodityTotal)}</p>
              </div>
              <div className="bg-warning-soft rounded-xl p-4">
                <PurchaseIcon className="text-warning size-5" />
                <p className="text-warning mt-3 text-xs font-semibold">Seller deduction</p>
                <p className="text-warning-strong mt-1 text-lg font-semibold">−{formatIndianCurrency(purchase.sellerDeduction)}</p>
              </div>
              <div className="border-line rounded-xl border p-4">
                <CashIcon className="text-ink-subtle size-5" />
                <p className="text-ink mt-3 text-sm font-semibold">Payment</p>
                {purchase.payments.length === 0 ? (
                  <p className="text-ink-subtle mt-1 text-xs">No payment recorded</p>
                ) : purchase.payments.map((payment, index) => (
                  <p className="text-ink-muted mt-1 text-xs capitalize" key={`${payment.paymentDate}-${index}`}>
                    {payment.mode} · {formatIndianCurrency(payment.amount)}
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
