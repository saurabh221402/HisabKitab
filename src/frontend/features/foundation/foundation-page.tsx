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
      <section className="app-hero-surface border-line relative overflow-hidden border-b">
        <div className="app-container grid min-h-[68vh] content-center gap-12 py-20 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="max-w-3xl">
            <div className="border-brand/15 bg-surface-raised/70 text-brand-strong mb-7 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold tracking-[0.12em] uppercase shadow-sm backdrop-blur">
              <span className="bg-brand size-2 rounded-full" aria-hidden="true" />
              {projectMetadata.phase}
            </div>

            <p className="text-accent mb-4 text-sm font-semibold tracking-[0.18em] uppercase">
              हिसाब साफ़ • कारोबार मजबूत
            </p>
            <h1 className="text-ink max-w-4xl text-5xl leading-[0.98] font-semibold tracking-[-0.045em] sm:text-6xl lg:text-7xl">
              Paper ka bharosa.
              <span className="text-brand block">Digital ki speed.</span>
            </h1>
            <p className="text-ink-muted mt-7 max-w-2xl text-lg leading-8 sm:text-xl">
              {projectMetadata.description} Built around the way Papa and Uncle
              already work—not around generic ERP screens.
            </p>
          </div>

          <aside className="border-line/80 bg-surface-raised/80 rounded-card shadow-feature self-end border p-6 backdrop-blur sm:p-8">
            <p className="text-ink-subtle text-xs font-semibold tracking-[0.16em] uppercase">
              Foundation status
            </p>
            <h2 className="text-ink mt-3 text-2xl font-semibold tracking-tight">
              Ready for the first vertical slice
            </h2>
            <ul className="mt-6 space-y-4">
              {foundationItems.map((item) => (
                <li key={item} className="text-ink-muted flex items-center gap-3 text-sm">
                  <span
                    className="bg-brand-soft text-brand grid size-6 shrink-0 place-items-center rounded-full text-xs font-bold"
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

      <section className="app-container app-section">
        <div className="max-w-2xl">
          <p className="text-brand text-sm font-semibold tracking-[0.14em] uppercase">
            One source of truth
          </p>
          <h2 className="text-ink mt-3 text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
            Simple on the screen. Structured underneath.
          </h2>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {operatingPrinciples.map((principle, index) => (
            <article
              key={principle.title}
              className="border-line bg-surface-raised rounded-card shadow-card group border p-6 transition-transform duration-300 hover:-translate-y-1 sm:p-7"
            >
              <div className="flex items-start justify-between gap-4">
                <p className="text-accent text-xs font-semibold tracking-[0.12em] uppercase">
                  {principle.eyebrow}
                </p>
                <span className="text-ink-subtle font-mono text-xs">0{index + 1}</span>
              </div>
              <h3 className="text-ink mt-8 text-xl font-semibold">
                {principle.title}
              </h3>
              <p className="text-ink-muted mt-3 leading-7">{principle.description}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
