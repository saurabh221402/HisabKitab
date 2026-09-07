# HisabKitab

HisabKitab is a business operating system for a family-run grain trading business in India. The business buys agricultural commodities from farmers and local traders, moves and settles those goods, and sells them to firms and mills.

The project is in **Phase 1: technical foundation and business-rule validation**. A strict TypeScript/Next.js modular-monolith foundation is in place, with frontend, backend, and future pure-domain code kept behind explicit boundaries. Supabase-hosted PostgreSQL is the selected remote database. Transaction schemas and financial posting code remain intentionally gated by validated business rules.

## Current working documents

- [Project context](docs/PROJECT_CONTEXT.md) — why the project exists, its journey, scope, principles, and current status.
- [Product and business discovery](docs/DISCOVERY.md) — market findings, proposed workflows, business-rule catalogue, risks, product scope, and technology recommendation.
- [Decision log](docs/DECISIONS.md) — accepted, proposed, and open decisions with their rationale.
- [Application architecture](docs/ARCHITECTURE.md) — frontend, backend, domain, security, and dependency boundaries.
- [Real transaction worksheet](docs/TRANSACTION_WORKSHEET.md) — information needed from actual paper transactions before implementation.
- [Lean V1 scope](docs/MVP_SCOPE.md) — the simplified modules, fields, workflows, offline behavior, and explicit deferrals for the first release.
- [Purchase Example 001](docs/examples/PURCHASE_EXAMPLE_001.md) — the first reconciled real-world purchase calculation and its unresolved accounting rules.
- [Sale Example 001](docs/examples/SALE_EXAMPLE_001.md) — the first sale calculation shape and the exact formula questions still open.

## Current next step

Resolve the open formulas in Sale Example 001, then capture one complete receipt/payment and daily cash-closing example. Those validated rules will drive the first purchase-to-payment vertical slice, its data model, posting rules, API contracts, and operator UI.

## Local development

Requirements: Node.js 20.9 or newer and pnpm 11.

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

The foundation page runs at `http://localhost:3000`. The non-secret health endpoint is `GET /api/health`.

Quality checks:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Never commit `.env.local`, database credentials, or a Supabase service-role key.
