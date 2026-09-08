import Link from "next/link";

import { AppShell } from "@/frontend/components/app-shell";
import { ArrowDownIcon, ArrowUpIcon, CashIcon } from "@/frontend/components/icons";
import { CashEntryForm } from "@/frontend/features/rokad/cash-entry-form";
import { formatIndianCurrency } from "@/frontend/lib/format-money";
import type { RokadDay, RokadReferenceData } from "@/shared/contracts/rokad";

export function RokadPage({
  day,
  maxBusinessDate,
  referenceData,
}: Readonly<{
  day: RokadDay;
  maxBusinessDate: string;
  referenceData: RokadReferenceData;
}>) {
  const isNegative = day.closingBalance.startsWith("-");
  const summaryCards = [
    { label: "Opening cash", note: "For selected day", value: day.openingBalance },
    { label: "CR · Cash In", note: "Money received", value: day.cashIn },
    { label: "DB · Cash Out", note: "Money given", value: day.cashOut },
    {
      label: "Expected closing",
      note: isNegative ? "⚠ Negative cash" : "Opening + CR − DB",
      value: day.closingBalance,
    },
  ] as const;

  return (
    <AppShell currentSection="rokad">
      <div className="mx-auto max-w-[92rem]">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-brand text-xs font-semibold tracking-[0.12em] uppercase">Daily cash book</p>
            <h1 className="text-ink mt-2 text-3xl font-semibold tracking-[-0.035em]">Rokad / रोकड़</h1>
            <p className="text-ink-muted mt-1.5 text-sm">One shared operational cash view with every source firm preserved.</p>
          </div>
          <form className="flex items-end gap-2" method="get">
            <label>
              <span className="text-ink-muted mb-1.5 block text-xs font-semibold">Business date</span>
              <input
                className="border-line bg-surface-raised text-ink min-h-10 rounded-xl border px-3 text-sm"
                defaultValue={day.businessDate}
                max={maxBusinessDate}
                name="date"
                type="date"
              />
            </label>
            <button className="bg-ink text-surface-raised min-h-10 rounded-xl px-4 text-sm font-semibold" type="submit">
              View
            </button>
          </form>
        </div>

        {!day.openingConfigured ? (
          <div className="bg-warning-soft text-warning-strong mt-5 rounded-xl px-4 py-3 text-sm">
            Initial cash opening is not configured yet. Totals are provisional from recorded movements and the Main user must set the verified opening before pilot use.
          </div>
        ) : null}

        <section className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map((card, index) => (
            <article
              className={`rounded-card border p-5 shadow-card ${index === 3 && isNegative ? "border-danger/30 bg-danger-soft" : "border-line bg-surface-raised"}`}
              key={card.label}
            >
              <p className="text-ink-muted text-xs font-semibold">{card.label}</p>
              <p className={`mt-3 text-2xl font-semibold tracking-[-0.035em] tabular-nums ${index === 3 && isNegative ? "text-danger" : "text-ink"}`}>
                {formatIndianCurrency(card.value)}
              </p>
              <p className="text-ink-subtle mt-2 text-[0.68rem]">{card.note}</p>
            </article>
          ))}
        </section>

        <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1fr)_23rem]">
          <section className="border-line bg-surface-raised rounded-card overflow-hidden border shadow-card">
            <div className="border-line flex items-center justify-between border-b px-5 py-4 sm:px-6">
              <div>
                <h2 className="text-ink text-lg font-semibold">Cash movements</h2>
                <p className="text-ink-subtle mt-1 text-xs">Source-linked entries appear only once.</p>
              </div>
              <span className="bg-canvas text-ink-muted rounded-lg px-2.5 py-1 text-xs font-semibold">{day.movements.length} entries</span>
            </div>

            {day.movements.length === 0 ? (
              <div className="px-6 py-16 text-center">
                <CashIcon className="text-ink-subtle mx-auto size-8" />
                <p className="text-ink mt-4 font-semibold">No cash movement on this date</p>
                <p className="text-ink-subtle mt-1 text-sm">Purchase cash payments and sale cash receipts will appear automatically.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[44rem] text-left text-sm">
                  <thead className="bg-canvas/70 text-ink-subtle text-[0.68rem] font-semibold uppercase">
                    <tr>
                      <th className="px-5 py-3" scope="col">Type</th>
                      <th className="px-4 py-3" scope="col">Person / party</th>
                      <th className="px-4 py-3" scope="col">Firm</th>
                      <th className="px-4 py-3" scope="col">Remark</th>
                      <th className="px-5 py-3 text-right" scope="col">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-line divide-y">
                    {day.movements.map((movement) => (
                      <tr key={movement.id}>
                        <td className="px-5 py-4">
                          <div className={`flex items-center gap-2 font-semibold ${movement.direction === "in" ? "text-brand" : "text-warning"}`}>
                            {movement.direction === "in" ? <ArrowDownIcon className="size-4" /> : <ArrowUpIcon className="size-4" />}
                            {movement.direction === "in" ? "CR · In" : "DB · Out"}
                          </div>
                          {movement.sourceUrl ? (
                            <Link className="text-ink-subtle hover:text-brand mt-1 block text-[0.68rem]" href={movement.sourceUrl}>
                              {movement.sourceLabel} ↗
                            </Link>
                          ) : (
                            <span className="text-ink-subtle mt-1 block text-[0.68rem]">{movement.sourceLabel}</span>
                          )}
                        </td>
                        <td className="text-ink px-4 py-4 font-medium">{movement.partyName}</td>
                        <td className="text-ink-muted px-4 py-4">{movement.firmName}</td>
                        <td className="text-ink-muted max-w-72 px-4 py-4">{movement.remark ?? "—"}</td>
                        <td className={`px-5 py-4 text-right font-semibold tabular-nums ${movement.direction === "in" ? "text-brand" : "text-warning"}`}>
                          {movement.direction === "in" ? "+" : "−"}{formatIndianCurrency(movement.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <aside className="border-line bg-surface-raised rounded-card border p-5 shadow-card xl:self-start">
            <h2 className="text-ink text-lg font-semibold">Manual cash entry</h2>
            <p className="text-ink-subtle mt-1 text-xs">Only for genuine cash movement not already linked to a purchase or sale.</p>
            <div className="mt-5">
              <CashEntryForm businessDate={day.businessDate} referenceData={referenceData} />
            </div>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}
