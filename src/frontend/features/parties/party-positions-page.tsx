import Link from "next/link";

import { AppShell } from "@/frontend/components/app-shell";
import { PlusIcon, SearchIcon, UsersIcon } from "@/frontend/components/icons";
import { formatIndianCurrency } from "@/frontend/lib/format-money";
import type { PartyPositionReport } from "@/shared/contracts/party-positions";

export function PartyPositionsPage({
  filters,
  report,
}: Readonly<{
  filters: { firmId: string; role: string; search: string };
  report: PartyPositionReport;
}>) {
  return (
    <AppShell currentSection="parties">
      <div className="mx-auto max-w-[92rem]">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-brand text-xs font-semibold tracking-[0.12em] uppercase">Party hisab</p>
            <h1 className="text-ink mt-2 text-3xl font-semibold tracking-[-0.035em]">Buyer & seller balances</h1>
            <p className="text-ink-muted mt-1.5 text-sm">Every amount is derived from posted source transactions.</p>
          </div>
          <Link
            className="bg-brand text-surface-raised inline-flex min-h-11 items-center gap-2 rounded-xl px-4 text-sm font-semibold"
            href="/masters"
          >
            <PlusIcon className="size-4" />
            Register party
          </Link>
        </div>

        <section className="mt-6 grid gap-3 sm:grid-cols-2">
          <article className="border-line bg-surface-raised rounded-card border p-5 shadow-card">
            <p className="text-ink-muted text-xs font-semibold">Total buyer outstanding / लेना है</p>
            <p className="text-brand mt-3 text-2xl font-semibold tracking-[-0.035em]">{formatIndianCurrency(report.totalBuyerOutstanding)}</p>
          </article>
          <article className="border-line bg-surface-raised rounded-card border p-5 shadow-card">
            <p className="text-ink-muted text-xs font-semibold">Seller + cost payable / देना है</p>
            <p className="text-warning mt-3 text-2xl font-semibold tracking-[-0.035em]">{formatIndianCurrency(report.totalSellerAndCostOutstanding)}</p>
          </article>
        </section>

        <form className="border-line bg-surface-raised rounded-card mt-4 grid gap-3 border p-4 shadow-card sm:grid-cols-[1fr_12rem_12rem_auto]" method="get">
          <label className="relative">
            <span className="sr-only">Search party</span>
            <SearchIcon className="text-ink-subtle pointer-events-none absolute top-3.5 left-3.5 size-4" />
            <input
              className="border-line bg-surface-raised text-ink min-h-11 w-full rounded-xl border pr-3 pl-10 text-sm outline-none focus:border-brand"
              defaultValue={filters.search}
              name="search"
              placeholder="Search party name"
            />
          </label>
          <label>
            <span className="sr-only">Filter by firm</span>
            <select className="border-line bg-surface-raised text-ink min-h-11 w-full rounded-xl border px-3 text-sm" defaultValue={filters.firmId} name="firm">
              <option value="">All firms</option>
              {report.firms.map((firm) => (
                <option key={firm.id} value={firm.id}>{firm.name}</option>
              ))}
            </select>
          </label>
          <label>
            <span className="sr-only">Filter by role</span>
            <select className="border-line bg-surface-raised text-ink min-h-11 w-full rounded-xl border px-3 text-sm" defaultValue={filters.role} name="role">
              <option value="">All roles</option>
              <option value="seller">Seller</option>
              <option value="buyer">Buyer</option>
              <option value="broker">Broker</option>
              <option value="transporter">Transporter</option>
            </select>
          </label>
          <button className="bg-ink text-surface-raised min-h-11 rounded-xl px-4 text-sm font-semibold" type="submit">Apply</button>
        </form>

        <section className="border-line bg-surface-raised rounded-card mt-4 overflow-hidden border shadow-card">
          {report.positions.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <UsersIcon className="text-ink-subtle mx-auto size-8" />
              <p className="text-ink mt-4 font-semibold">No matching balance</p>
              <p className="text-ink-subtle mt-1 text-sm">Posted purchase and sale balances will appear here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[58rem] text-left text-sm">
                <thead className="bg-canvas/70 text-ink-subtle text-[0.68rem] font-semibold uppercase">
                  <tr>
                    <th className="px-5 py-3" scope="col">Party</th>
                    <th className="px-4 py-3" scope="col">Firm</th>
                    <th className="px-4 py-3 text-right" scope="col">Buyer due</th>
                    <th className="px-4 py-3 text-right" scope="col">Seller due</th>
                    <th className="px-4 py-3 text-right" scope="col">Broker due</th>
                    <th className="px-4 py-3 text-right" scope="col">Transport due</th>
                    <th className="px-5 py-3 text-right" scope="col">Last activity</th>
                  </tr>
                </thead>
                <tbody className="divide-line divide-y">
                  {report.positions.map((position) => (
                    <tr key={`${position.firmId}-${position.partyId}`}>
                      <td className="px-5 py-4">
                        <p className="text-ink font-semibold">{position.partyName}</p>
                        <p className="text-ink-subtle mt-1 text-[0.68rem] capitalize">{position.roles.join(" · ")}</p>
                      </td>
                      <td className="text-ink-muted px-4 py-4">{position.firmName}</td>
                      <td className="text-brand px-4 py-4 text-right font-semibold">{formatIndianCurrency(position.buyerOutstanding)}</td>
                      <td className="text-warning px-4 py-4 text-right font-semibold">{formatIndianCurrency(position.sellerOutstanding)}</td>
                      <td className="text-ink-muted px-4 py-4 text-right">{formatIndianCurrency(position.brokerageOutstanding)}</td>
                      <td className="text-ink-muted px-4 py-4 text-right">{formatIndianCurrency(position.transportOutstanding)}</td>
                      <td className="text-ink-subtle px-5 py-4 text-right">{position.lastActivityDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
