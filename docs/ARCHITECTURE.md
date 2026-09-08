# HisabKitab — Application Architecture

Last updated: 8 September 2026

Status: Phase 1 operational core implemented; authenticated operator validation pending

## Architecture choice

HisabKitab is a modular monolith: one deployable Next.js application with strict internal responsibility boundaries and one Supabase-hosted PostgreSQL database.

This gives the project a single operational unit without mixing frontend, backend, domain, and infrastructure code.

## Source boundaries

```text
src/app
  Next.js pages, layouts, and HTTP route adapters only
        |
        +--> src/frontend
        |      presentation, interaction, formatting, accessibility
        |
        +--> src/backend
               application use cases, authorization, persistence adapters
                         |
                         +--> src/domain
                                pure business rules and exact calculations

src/shared
  small environment-neutral types or constants genuinely shared by both sides
```

### `src/app`

- Owns framework routing and request/response adaptation.
- Pages delegate presentation to `src/frontend`.
- Route Handlers delegate operations to `src/backend`.
- Must not contain financial formulas, persistence logic, or permission rules.

### `src/frontend`

- Owns accessible components, form interaction, tables, and view formatting.
- May consume explicit transport contracts.
- Must not import `src/backend`, database clients, secrets, or server-only modules.
- Client validation improves usability but is never the integrity boundary.

### `src/backend`

- Owns application use cases, authentication/authorization, transaction boundaries, persistence, integrations, and safe API results.
- Must not import frontend components.
- Database and Supabase access must remain server-only.
- Every protected operation authenticates and authorizes at the operation boundary.

### `src/domain`

- Owns business terminology, invariants, formula policies, exact calculations, and state transitions.
- Must not depend on Next.js, React, Prisma, Supabase, HTTP, or UI code.
- Unresolved money, stock, tax, or settlement behavior must not be invented here.

### `src/shared`

- Contains only genuinely environment-neutral code.
- Must not become a miscellaneous utility directory or a way to bypass boundaries.

## Global design-system boundary

- `src/app/globals.css` owns semantic design tokens for typography, colors, spacing, surfaces, borders, focus treatment, radii, and shadows. Shared manifest/browser-chrome values live in `src/shared/ui-theme.ts` because CSS custom properties are unavailable to Next.js metadata generation.
- Feature components use semantic tokens such as `brand`, `surface`, `ink`, and `line`; they do not establish competing page-level themes or repeat raw brand color values.
- Components still own local layout and interaction states when those choices are specific to the component.
- Reusable interface primitives will live under `src/frontend` and consume the same global tokens.
- A future alternate theme changes token values at the global boundary rather than rewriting feature components.

## Data and security boundary

```text
Browser
  |
  | authenticated, validated request
  v
Next.js route/action adapter
  |
  v
Backend application service
  |
  | authorized business operation + database transaction
  v
Supabase-hosted PostgreSQL
```

The browser will not write directly to financial tables. Supabase credentials remain in ignored local environment files or the deployment platform’s secret store. Public project identifiers may be committed; passwords, database URLs containing credentials, and service-role keys may not.

## Dependency rules

1. Dependencies point inward toward domain policy, never outward from the domain to frameworks.
2. Use direct imports; do not create broad barrel files that hide module ownership.
3. Keep request/user state local to the request; never store it in mutable module globals.
4. Server Actions and Route Handlers are public security boundaries and must authenticate, authorize, and validate inputs.
5. Financial writes use idempotency plus PostgreSQL transactions and constraints.
6. Exact decimal values cross boundaries as explicit decimal strings, never JavaScript binary floating point.
7. Only server-confirmed records affect balances; local/offline records remain visibly labelled drafts.

## Implemented data boundary

Versioned Supabase migrations now provide business firms, user profiles and firm access, reusable parties and roles, commodities, bank accounts, purchases and sales, linked payments and split receipts, manual cash entries, one controlled operational-cash opening, audit events, and security-invoker reporting views. Every exposed table has RLS enabled. The browser submits financial work only through authenticated server actions; PostgreSQL revalidates posting invariants and commits each aggregate, settlement portions, status, and audit event in one transaction.

Purchase and sale arithmetic are implemented independently in `src/domain`: whole kilograms and whole-rupee rates produce integer paise exactly. Database generated columns and posting checks independently enforce the same weight and money relationships. Posted records receive no direct update or delete path in these slices.

Daily Rokad is a read model over posted cash purchase payments, posted cash sale receipts, and explicit manual cash entries. Bank balances similarly derive from account openings plus source-linked bank movements. Party positions and dashboard KPIs are read models over the same posted sources; the UI never asks operators to reproduce ledger totals manually.

Supabase Auth uses cookie-based SSR with `@supabase/ssr`; the Next.js proxy refreshes and validates claims before protected routes. A missing local key leaves the design preview available for setup, while a configured project requires login.

The production build currently uses Next.js's supported webpack path. Turbopack's CSS worker cannot bind its internal local port in the current Codex execution environment; this choice is a build-environment compatibility measure, not an application architecture dependency, and can be re-evaluated after the toolchain changes.
