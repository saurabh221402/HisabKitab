import Link from "next/link";

import { AppShell } from "@/frontend/components/app-shell";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  CalendarIcon,
  CashIcon,
  PlusIcon,
  PurchaseIcon,
  SaleIcon,
  UsersIcon,
  WeightIcon,
} from "@/frontend/components/icons";
import { formatIndianCurrency } from "@/frontend/lib/format-money";
import { formatQuintalsFromKilograms } from "@/frontend/lib/format-weight";
import type { DashboardOverview } from "@/shared/contracts/dashboard";

function formatBusinessDate(businessDate: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "full",
    timeZone: "Asia/Kolkata",
  }).format(new Date(`${businessDate}T00:00:00+05:30`));
}

export function DashboardPage({
  overview,
}: Readonly<{ overview: DashboardOverview }>) {
  const metrics = [
    {
      accent: "brand",
      eyebrow: "Net Purchase Value",
      helper: overview.netPurchase.helper,
      icon: PurchaseIcon,
      value: overview.netPurchase.value,
    },
    {
      accent: "accent",
      eyebrow: "Gross Sale Value",
      helper: overview.grossSale.helper,
      icon: SaleIcon,
      value: overview.grossSale.value,
    },
    {
      accent: "warning",
      eyebrow: "Seller Outstanding",
      helper: overview.sellerOutstanding.helper,
      icon: ArrowUpIcon,
      value: overview.sellerOutstanding.value,
    },
    {
      accent: "info",
      eyebrow: "Buyer Outstanding",
      helper: overview.buyerOutstanding.helper,
      icon: ArrowDownIcon,
      value: overview.buyerOutstanding.value,
    },
  ] as const;
  const activePartyCount = new Set(
    overview.recentTransactions.map((transaction) => transaction.partyName),
  ).size;

  return (
    <AppShell currentSection="dashboard">
      <div className="mx-auto max-w-[92rem]">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <div className="text-ink-subtle flex items-center gap-2 text-sm">
              <CalendarIcon className="size-4" />
              {formatBusinessDate(overview.businessDate)}
            </div>
            <h1 className="text-ink mt-2 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
              Namaste, {overview.displayName}
            </h1>
            <p className="text-ink-muted mt-2">Aaj ke karobar ka seedha hisab.</p>
          </div>
          <div className="flex gap-2">
            <Link
              className="border-line bg-surface-raised text-ink hover:border-brand/35 inline-flex min-h-11 items-center gap-2 rounded-xl border px-4 text-sm font-semibold shadow-sm transition-colors"
              href="/sales"
            >
              <SaleIcon className="text-accent size-4" />
              New Sale
            </Link>
            <Link
              className="bg-brand text-surface-raised hover:bg-brand-strong inline-flex min-h-11 items-center gap-2 rounded-xl px-4 text-sm font-semibold shadow-sm transition-colors"
              href="/purchases/new"
            >
              <PlusIcon className="size-4" />
              New Purchase
            </Link>
          </div>
        </div>

        <section aria-labelledby="position-heading" className="mt-8">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-ink text-sm font-semibold" id="position-heading">
              Business position
            </h2>
            <p className="text-ink-subtle text-xs">Live records · All authorized firms</p>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {metrics.map((metric) => {
              const Icon = metric.icon;
              const accentClass =
                metric.accent === "brand"
                  ? "bg-brand-soft text-brand"
                  : metric.accent === "accent"
                    ? "bg-accent-soft text-accent"
                    : metric.accent === "warning"
                      ? "bg-warning-soft text-warning"
                      : "bg-info-soft text-info";

              return (
                <article
                  className="border-line bg-surface-raised rounded-card border p-5 shadow-card"
                  key={metric.eyebrow}
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-ink-muted text-xs font-medium">{metric.eyebrow}</p>
                    <span className={`grid size-9 place-items-center rounded-xl ${accentClass}`}>
                      <Icon className="size-[1.05rem]" />
                    </span>
                  </div>
                  <p className="text-ink mt-5 text-2xl font-semibold tracking-[-0.035em]">
                    {formatIndianCurrency(metric.value)}
                  </p>
                  <p className="text-ink-subtle mt-1.5 text-xs">{metric.helper}</p>
                </article>
              );
            })}
          </div>
        </section>

        <div className="mt-4 grid gap-4 xl:grid-cols-[1.6fr_0.8fr]">
          <section className="border-line bg-surface-raised rounded-card min-w-0 border shadow-card">
            <div className="border-line flex items-center justify-between border-b px-5 py-4 sm:px-6">
              <div>
                <h2 className="text-ink font-semibold">Recent transactions</h2>
                <p className="text-ink-subtle mt-1 text-xs">Latest posted purchases and sales</p>
              </div>
              <Link className="text-brand text-sm font-semibold" href="/rokad">
                View Rokad
              </Link>
            </div>

            {overview.recentTransactions.length === 0 ? (
              <div className="px-6 py-16 text-center">
                <CashIcon className="text-ink-subtle mx-auto size-8" />
                <p className="text-ink mt-4 font-semibold">No posted transactions yet</p>
                <p className="text-ink-subtle mt-1 text-sm">Your first purchase or sale will appear here.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[42rem] text-left text-sm">
                  <thead className="text-ink-subtle bg-canvas/65 text-[0.68rem] font-semibold tracking-[0.08em] uppercase">
                    <tr>
                      <th className="px-6 py-3" scope="col">Party / Type</th>
                      <th className="px-4 py-3" scope="col">Weight</th>
                      <th className="px-4 py-3" scope="col">Firm</th>
                      <th className="px-4 py-3 text-right" scope="col">Amount</th>
                      <th className="px-6 py-3 text-right" scope="col">Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-line divide-y">
                    {overview.recentTransactions.map((transaction) => (
                      <tr className="hover:bg-canvas/45 transition-colors" key={transaction.id}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <span
                              className={`grid size-9 place-items-center rounded-xl ${
                                transaction.transactionType === "purchase"
                                  ? "bg-brand-soft text-brand"
                                  : "bg-accent-soft text-accent"
                              }`}
                            >
                              {transaction.transactionType === "purchase" ? (
                                <PurchaseIcon className="size-4" />
                              ) : (
                                <SaleIcon className="size-4" />
                              )}
                            </span>
                            <div>
                              <Link className="text-ink hover:text-brand font-medium" href={transaction.url}>
                                {transaction.partyName}
                              </Link>
                              <p className="text-ink-subtle mt-0.5 text-xs capitalize">
                                {transaction.transactionType} · {transaction.businessDate}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="text-ink-muted px-4 py-4">{formatQuintalsFromKilograms(transaction.weightKg)}</td>
                        <td className="text-ink-muted px-4 py-4">{transaction.firmName}</td>
                        <td className="text-ink px-4 py-4 text-right font-semibold tabular-nums">
                          {formatIndianCurrency(transaction.amount)}
                        </td>
                        <td className="text-warning px-6 py-4 text-right text-xs font-semibold">
                          {formatIndianCurrency(transaction.pendingBalance)} pending
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
            <section className="bg-ink text-surface-raised rounded-card relative overflow-hidden p-6 shadow-feature">
              <div className="bg-brand/30 absolute -top-12 -right-10 size-40 rounded-full blur-2xl" aria-hidden="true" />
              <div className="relative">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-surface-raised/60 text-xs font-semibold tracking-[0.12em] uppercase">
                    Total available funds
                  </p>
                  <CashIcon className="text-surface-raised/55 size-5" />
                </div>
                <p className="mt-5 text-3xl font-semibold tracking-[-0.04em]">
                  {overview.cashOpeningConfigured
                    ? formatIndianCurrency(overview.totalAvailableFunds)
                    : "Opening needed"}
                </p>
                <p className="text-surface-raised/55 mt-2 text-sm leading-6">
                  {overview.cashOpeningConfigured
                    ? "Shared operational cash plus recorded firm bank balances."
                    : "Set verified physical cash before treating this KPI as official."}
                </p>
                <Link className="bg-surface-raised/10 mt-5 flex items-center justify-between rounded-xl px-4 py-3 text-sm" href="/rokad">
                  <span className="text-surface-raised/65">Cash + firm banks</span>
                  <span className="font-semibold">Open Rokad</span>
                </Link>
              </div>
            </section>

            <section className="border-line bg-surface-raised rounded-card border p-6 shadow-card">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-ink font-semibold">Today’s movement</h2>
                  <p className="text-ink-subtle mt-1 text-xs">Weight handled</p>
                </div>
                <WeightIcon className="text-brand size-5" />
              </div>
              <div className="mt-5 flex items-end justify-between gap-5">
                <div>
                  <p className="text-ink text-3xl font-semibold tracking-[-0.04em]">
                    {formatQuintalsFromKilograms(overview.totalWeightKg)}
                  </p>
                  <p className="text-ink-subtle mt-1 text-xs">
                    Sales: {formatQuintalsFromKilograms(overview.saleWeightKg)}
                  </p>
                </div>
                <span
                  aria-label={`${activePartyCount} active parties`}
                  className="bg-brand-soft text-brand grid size-10 place-items-center rounded-full text-sm font-bold"
                >
                  {activePartyCount}
                </span>
              </div>
              <Link className="text-brand mt-5 inline-flex items-center gap-2 text-sm font-semibold" href="/masters">
                <UsersIcon className="size-4" />
                View parties
              </Link>
            </section>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
