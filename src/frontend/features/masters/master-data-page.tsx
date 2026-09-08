import { AppShell } from "@/frontend/components/app-shell";
import { UsersIcon, WeightIcon } from "@/frontend/components/icons";
import {
  CommodityRegistrationForm,
  PartyRegistrationForm,
} from "@/frontend/features/masters/master-registration-forms";
import type { MasterDataOverview, PartyRole } from "@/shared/contracts/master-data";

const roleLabels: Record<PartyRole, string> = {
  broker: "Broker",
  buyer: "Buyer",
  seller: "Seller",
  transporter: "Transporter",
};

export function MasterDataPage({ data }: Readonly<{ data: MasterDataOverview }>) {
  return (
    <AppShell currentSection="masters">
      <div className="mx-auto max-w-[92rem]">
        <div>
          <p className="text-brand text-xs font-semibold tracking-[0.12em] uppercase">Reusable records</p>
          <h1 className="text-ink mt-2 text-3xl font-semibold tracking-[-0.035em]">Party & commodity masters</h1>
          <p className="text-ink-muted mt-2 text-sm">Register once, then reuse in every purchase and sale.</p>
        </div>

        <div className="mt-7 grid gap-4 xl:grid-cols-[1fr_22rem]">
          <section className="border-line bg-surface-raised rounded-card min-w-0 border shadow-card">
            <div className="border-line flex items-center justify-between gap-3 border-b px-5 py-4 sm:px-6">
              <div>
                <h2 className="text-ink flex items-center gap-2 font-semibold"><UsersIcon className="text-brand size-4" /> Parties</h2>
                <p className="text-ink-subtle mt-1 text-xs">{data.parties.length} registered</p>
              </div>
            </div>
            {data.parties.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <p className="text-ink font-semibold">No parties registered yet</p>
                <p className="text-ink-subtle mt-2 text-sm">Start with the seller for the first purchase.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[40rem] text-left text-sm">
                  <thead className="bg-canvas/65 text-ink-subtle text-[0.68rem] font-semibold tracking-[0.08em] uppercase">
                    <tr>
                      <th className="px-6 py-3" scope="col">Party</th>
                      <th className="px-4 py-3" scope="col">Roles</th>
                      <th className="px-4 py-3" scope="col">Mobile</th>
                      <th className="px-6 py-3" scope="col">Place</th>
                    </tr>
                  </thead>
                  <tbody className="divide-line divide-y">
                    {data.parties.map((party) => (
                      <tr key={party.id}>
                        <td className="text-ink px-6 py-4 font-semibold">{party.name}</td>
                        <td className="px-4 py-4">
                          <div className="flex flex-wrap gap-1.5">
                            {party.roles.map((role) => (
                              <span className="bg-brand-soft text-brand-strong rounded-md px-2 py-1 text-[0.68rem] font-semibold" key={role}>
                                {roleLabels[role]}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="text-ink-muted px-4 py-4">{party.mobile ?? "—"}</td>
                        <td className="text-ink-muted px-6 py-4">{party.address ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <aside className="border-line bg-surface-raised rounded-card border p-5 shadow-card sm:p-6 xl:row-span-2">
            <h2 className="text-ink font-semibold">Register new party</h2>
            <p className="text-ink-subtle mt-1 text-xs">GSTIN is optional.</p>
            <div className="mt-5"><PartyRegistrationForm /></div>
          </aside>

          <section className="border-line bg-surface-raised rounded-card border p-5 shadow-card sm:p-6">
            <div className="flex items-center gap-2">
              <WeightIcon className="text-brand size-4" />
              <h2 className="text-ink font-semibold">Commodities</h2>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {data.commodities.map((commodity) => (
                <span className="border-line bg-canvas text-ink rounded-xl border px-3 py-2 text-sm font-medium" key={commodity.id}>
                  {commodity.name}{commodity.localName ? ` / ${commodity.localName}` : ""}
                </span>
              ))}
            </div>
            <details className="border-line mt-5 border-t pt-4">
              <summary className="text-brand cursor-pointer text-sm font-semibold">Add another commodity</summary>
              <div className="mt-4 max-w-lg"><CommodityRegistrationForm /></div>
            </details>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
