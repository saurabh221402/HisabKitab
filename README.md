# HisabKitab

HisabKitab is a business operating system for a family-run grain trading business in India. The business buys agricultural commodities from farmers and local traders, moves and settles those goods, and sells them to firms and mills.

The project is in **Phase 1 operator validation**. A strict TypeScript/Next.js modular monolith now includes a responsive live dashboard, invite-only Supabase SSR authentication for Papa and Uncle, reusable party/commodity masters, exact purchase and sale posting, buyer/seller balances, split receipts, a derived Daily Rokad, and reload-safe device drafts. Frontend, backend, pure domain logic, and database migrations remain behind explicit boundaries.

## Current working documents

- [Project context](docs/PROJECT_CONTEXT.md) — why the project exists, its journey, scope, principles, and current status.
- [Product and business discovery](docs/DISCOVERY.md) — market findings, proposed workflows, business-rule catalogue, risks, product scope, and technology recommendation.
- [Decision log](docs/DECISIONS.md) — accepted, proposed, and open decisions with their rationale.
- [Application architecture](docs/ARCHITECTURE.md) — frontend, backend, domain, security, and dependency boundaries.
- [Phase 1 PRD](docs/PRD_PHASE_1.md) — goals, modules, workflows, KPI definitions, UX, acceptance criteria, delivery sequence, and blocking decisions.
- [Real transaction worksheet](docs/TRANSACTION_WORKSHEET.md) — information needed from actual paper transactions before implementation.
- [Lean V1 scope](docs/MVP_SCOPE.md) — the simplified modules, fields, workflows, offline behavior, and explicit deferrals for the first release.
- [Purchase Example 001](docs/examples/PURCHASE_EXAMPLE_001.md) — the first reconciled real-world purchase calculation and its unresolved accounting rules.
- [Sale Example 001](docs/examples/SALE_EXAMPLE_001.md) — the validated sale calculation shape and the exact rates/receipt values still open.

## Current next step

Register the real operating parties and firm bank accounts, then run the canonical purchase and sale examples through the authenticated application with Papa and Uncle. Reconcile them with paper, then enter verified opening cash/bank balances before treating liquidity as official.

## Local development

Requirements: Node.js 22 or newer and pnpm 11.

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

The authenticated app runs at `http://localhost:3000`. Copy `.env.example` to `.env.local` and add the Supabase publishable key before login. The non-secret health endpoint is `GET /api/health`.

Quality checks:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Never commit `.env.local`, database credentials, or a Supabase service-role key.
