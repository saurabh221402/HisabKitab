import { projectMetadata } from "@/shared/project-metadata";

const operatingPrinciples = [
  {
    description: "Seller, weight, rate, deductions, payment and balance—together.",
    eyebrow: "खरीद / Purchase",
    title: "Buy with clarity",
  },
  {
    description: "Buyer, broker, transport, receipt and outstanding—traceable.",
    eyebrow: "बिक्री / Sale",
    title: "Sell with confidence",
  },
  {
    description: "DB means cash out. CR means cash in. Every rupee has a source.",
    eyebrow: "रोकड़ / Cash",
    title: "Know today’s position",
  },
] as const;

const foundationItems = [
  "Responsive web foundation",
  "Separated frontend and backend",
  "Supabase PostgreSQL selected",
  "Strict TypeScript and automated checks",
] as const;

export function FoundationPage() {
  return (
    <main>
      <section className="relative overflow-hidden border-b border-stone-200 bg-[radial-gradient(circle_at_top_right,_rgba(20,83,45,0.11),_transparent_42%),linear-gradient(180deg,#fffdf7_0%,#f6f1e7_100%)]">
        <div className="mx-auto grid min-h-[68vh] max-w-6xl content-center gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[1.25fr_0.75fr] lg:px-10">
          <div className="max-w-3xl">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-emerald-800/15 bg-white/70 px-3 py-1.5 text-xs font-semibold tracking-[0.12em] text-emerald-950 uppercase shadow-sm backdrop-blur">
              <span className="size-2 rounded-full bg-emerald-700" aria-hidden="true" />
              {projectMetadata.phase}
            </div>

            <p className="mb-4 text-sm font-semibold tracking-[0.18em] text-amber-700 uppercase">
              हिसाब साफ़ • कारोबार मजबूत
            </p>
            <h1 className="max-w-4xl text-5xl leading-[0.98] font-semibold tracking-[-0.045em] text-stone-950 sm:text-6xl lg:text-7xl">
              Paper ka bharosa.
              <span className="block text-emerald-800">Digital ki speed.</span>
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-stone-600 sm:text-xl">
              {projectMetadata.description} Built around the way Papa and Uncle
              already work—not around generic ERP screens.
            </p>
          </div>

          <aside className="self-end rounded-3xl border border-stone-200/80 bg-white/80 p-6 shadow-[0_24px_80px_-40px_rgba(41,37,36,0.45)] backdrop-blur sm:p-8">
            <p className="text-xs font-semibold tracking-[0.16em] text-stone-500 uppercase">
              Foundation status
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-stone-950">
              Ready for the first vertical slice
            </h2>
            <ul className="mt-6 space-y-4">
              {foundationItems.map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm text-stone-700">
                  <span
                    className="grid size-6 shrink-0 place-items-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-800"
                    aria-hidden="true"
                  >
                    ✓
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 lg:px-10 lg:py-24">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold tracking-[0.14em] text-emerald-800 uppercase">
            One source of truth
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-stone-950 sm:text-4xl">
            Simple on the screen. Structured underneath.
          </h2>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {operatingPrinciples.map((principle, index) => (
            <article
              key={principle.title}
              className="group rounded-3xl border border-stone-200 bg-white p-6 shadow-[0_18px_55px_-44px_rgba(41,37,36,0.6)] transition-transform duration-300 hover:-translate-y-1 sm:p-7"
            >
              <div className="flex items-start justify-between gap-4">
                <p className="text-xs font-semibold tracking-[0.12em] text-amber-700 uppercase">
                  {principle.eyebrow}
                </p>
                <span className="font-mono text-xs text-stone-400">0{index + 1}</span>
              </div>
              <h3 className="mt-8 text-xl font-semibold text-stone-950">
                {principle.title}
              </h3>
              <p className="mt-3 leading-7 text-stone-600">{principle.description}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
